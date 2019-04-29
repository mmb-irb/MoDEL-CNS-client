import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from 'react';
import { fromPairs, noop } from 'lodash-es';
import {
  select,
  scaleLinear,
  axisBottom,
  axisLeft,
  extent,
  line,
  mouse,
  zoom,
  event,
} from 'd3';
import { ColormakerRegistry } from 'ngl';
import cn from 'classnames';

import { FormControlLabel, Checkbox, Button } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { Slider } from '@material-ui/lab';

import { PdbCtx } from '../../contexts';
import { NICE_NAMES, COLORS } from '../../utils/constants';

import addTextBackground from './add-text-background';
import addMasks from './add-masks';

import style from './style.module.css';

const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };
const NUMBER_OF_DATA_POINTS_ON_SCREEN_AT_MAX_ZOOM = 100;

const scheme = new ColormakerRegistry.schemes.element();
const dPR = window.devicePixelRatio || 1;

const Graph = ({
  y: yData,
  step = 1,
  startsAtOne = false,
  defaultPrecision,
  yLabel,
  xScaleFactor = 1,
  xLabel,
  type = 'line',
  mean = true,
  standardDeviation = true,
  onHover,
  selected,
  onSelect,
}) => {
  const pdbData = useContext(PdbCtx);

  const containerRef = useRef(null);
  const drawRef = useRef(noop);
  const selectedRef = useRef(new Set());
  const pdbDataRef = useRef({});

  const yEntries = Object.entries(yData);
  const yKeys = yEntries.map(([key]) => key);
  const [lab, setLabels] = useState(fromPairs(yKeys.map(key => [key, true])));
  const [pr, setPrecision] = useState(defaultPrecision || 1);

  const prevLabels = useRef(lab);
  const prevPrecision = useRef(pr);
  const prevRescaleX = useRef(scale => scale);

  useEffect(() => {
    drawRef.current && pdbData && pdbData.file && drawRef.current();
  }, [pdbData]);

  // should only be run once
  useEffect(() => {
    let canvas;
    let canvasContext;
    if (type === 'dash') {
      canvas = select(containerRef.current).append('canvas');
      canvasContext = canvas.node().getContext('2d');
    }
    const graph = select(containerRef.current).append('svg');
    const defs = graph.append('defs');
    // text background
    const textBackgroundURL = addTextBackground(defs);

    // mask opacity
    const [startMaskURL, endMaskURL] = addMasks(defs);

    const main = graph.append('g');

    // selected
    const selectedRect =
      selected instanceof Set
        ? null
        : main
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 0)
            .attr('height', '100%')
            .attr('fill', '#c8c8c8');

    const allDotGroups = main.append('g');

    // order is important, everything before that will be hidden by masks
    // masks
    graph
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', MARGIN.left)
      .attr('height', '100%')
      .style('fill', startMaskURL);
    const maskEnd = graph
      .append('rect')
      .attr('y', 0)
      .attr('height', '100%')
      .style('fill', endMaskURL);

    // axes
    const axes = {
      x: graph.append('g'),
      y: graph.append('g'),
    };

    // zoom
    //   make zoom extent dynamic depending on number of data points
    //   ↳ results in similar precision at maximum zoom regardless of data size
    const maxZoomExtent =
      yEntries[0][1].data.length / NUMBER_OF_DATA_POINTS_ON_SCREEN_AT_MAX_ZOOM;
    const graphZoom = zoom().scaleExtent([1, maxZoomExtent]);
    graph.call(graphZoom);
    graphZoom.on('zoom', () => {
      allDotGroups.selectAll('g.dot-group').attr('opacity', 0);
      drawRef.current({
        rescaleX: event.transform.rescaleX.bind(event.transform),
      });
    });

    // labels
    if (yLabel) {
      axes.yLabel = graph
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text(yLabel);
    }
    if (xLabel) {
      axes.xLabel = graph
        .append('text')
        .style('text-anchor', 'middle')
        .text(xLabel);
    }

    drawRef.current = ({
      hovered,
      precision = prevPrecision.current,
      labels = prevLabels.current,
      rescaleX = prevRescaleX.current,
      selected = selectedRef.current,
      pdbData = pdbDataRef.current,
    } = {}) => {
      // container size
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      graph.attr('width', width).attr('height', height);
      if (canvas) {
        canvas.attr('width', width * dPR).attr('height', height * dPR);
        canvas.style('width', `${width}px`).style('height', `${height}px`);
      }

      maskEnd.attr('x', width - MARGIN.right).attr('width', MARGIN.right);

      const xMin = 0;
      const xMax = yEntries[0][1].data.length * step - (startsAtOne ? step : 0);
      // x axis
      const x = rescaleX(
        scaleLinear()
          .domain([xMin, xMax])
          .range([MARGIN.left, width - MARGIN.right]),
      );
      const xAxis = g =>
        g.attr('transform', `translate(0, ${height - MARGIN.bottom})`).call(
          axisBottom(x)
            .ticks(width / 100)
            .tickSizeOuter(0)
            .tickFormat(d => {
              const tickValue = (d + (startsAtOne ? step : 0)) * xScaleFactor;
              if (tickValue >= xMin && tickValue <= xMax) {
                return +tickValue.toFixed(2);
              }
            }),
        );
      axes.x.call(xAxis);
      if (axes.xLabel) {
        axes.xLabel.attr('transform', `translate(${width / 2}, ${height - 5})`);
      }

      // y axis/axes
      const y = scaleLinear()
        .domain(
          extent(
            yEntries
              .filter(([key]) => labels[key])
              .map(([, { data }]) => extent(data))
              .flat(),
          ),
        )
        .nice()
        .range([height - MARGIN.bottom, MARGIN.top]);
      const yAxis = g =>
        g
          .attr('transform', `translate(${MARGIN.left}, 0)`)
          .transition()
          .call(axisLeft(y).ticks(8, '.2f'));
      axes.y.call(yAxis);
      if (axes.yLabel) {
        axes.yLabel.attr('y', 0).attr('x', 0 - height / 2);
      }

      // mean line
      if (mean) {
        const meanLines = main.selectAll('line.mean').data(yKeys);
        meanLines
          .enter()
          .append('line')
          .attr('class', 'mean')
          .attr('stroke', d => COLORS.get(d))
          .merge(meanLines)
          .attr('x1', x(xMin))
          .attr('x2', x(xMax))
          .attr('y1', d => y(yData[d].average))
          .attr('y2', d => y(yData[d].average))
          .transition()
          .attr('opacity', d => (labels[d] ? 0.5 : 0));
      }
      // mean ± 1σ area
      if (standardDeviation) {
        const sdRects = main.selectAll('rect.sd').data(yKeys);
        sdRects
          .enter()
          .append('rect')
          .attr('class', 'sd')
          .attr('fill', d => COLORS.get(d))
          .merge(sdRects)
          .attr('x', x(xMin))
          .attr('width', x(xMax) - x(xMin))
          .attr('y', d => y(yData[d].average + yData[d].stddev))
          .attr(
            'height',
            d =>
              y(yData[d].average - yData[d].stddev) -
              y(yData[d].average + yData[d].stddev),
          )
          .transition()
          .attr('opacity', d => (labels[d] ? 0.1 : 0));
      }

      const minIndex = Math.floor(x.invert(0) / step / precision);
      const maxIndex = Math.ceil(x.invert(width) / step / precision);
      // if type of graph is line
      if (type === 'line') {
        // lines
        const lineFn = line()
          .defined((_, i) => i >= minIndex && i <= maxIndex)
          .x((_, i) => x(i * step * precision))
          .y(d => y(d));
        const lines = main.selectAll('path.line').data(yKeys);
        lines
          .enter()
          .append('path')
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', d => COLORS.get(d))
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .merge(lines)
          .attr('d', d =>
            lineFn(yData[d].data.filter((_, i) => i % precision === 0)),
          )
          .transition()
          .attr('opacity', d => (labels[d] ? 1 : 0))
          .attr('stroke-width', d => (hovered === d ? 3 : 1.5));

        // selected
        const width = Math.max(1, x(precision * step) - x(0));
        selectedRect
          .attr('width', () => width)
          .attr('x', () =>
            Number.isInteger(selected) ? x(selected * step) - width / 2 : 0,
          )
          .attr('opacity', selected === null ? 0 : 1);

        // if type of graph is dash
      } else if (type === 'dash' && canvasContext) {
        const dashWidth = Math.max(1, x(1) - x(0));
        const dashHeight = 5;
        canvasContext.clearRect(0, 0, width, height);
        for (const [key, { data }] of yEntries) {
          if (!labels[key]) continue;
          // selected areas
          canvasContext.fillStyle = '#c8c8c8';
          for (const atom of selected) {
            // skip the ones not in view
            if (atom < minIndex || atom > maxIndex) continue;
            canvasContext.fillRect(
              (x(atom * step * precision - (startsAtOne ? step : 0)) -
                dashWidth / 2) *
                dPR,
              0,
              dashWidth * dPR,
              height * dPR,
            );
          }
          canvasContext.fillStyle = COLORS.get(key);
          const maxInView = Math.min(data.length - 1, maxIndex);
          // each atom in view
          for (
            let index = Math.max(0, minIndex);
            index <= maxInView;
            index += step
          ) {
            if (pdbData.file) {
              const atom = pdbData.file.atomMap.get(
                pdbData.file.atomStore.atomTypeId[index],
              );
              if (atom) {
                const color = `#${scheme
                  .atomColor(atom)
                  .toString(16)
                  .padStart(6, '0')}`;
                canvasContext.fillStyle =
                  color === '#ffffff' ? '#eeeeee' : color;
              }
            }

            canvasContext.fillRect(
              (x(index * step * precision) - dashWidth / 2) * dPR,
              (y(data[index]) - dashHeight / 2) * dPR,
              dashWidth * dPR,
              dashHeight * dPR,
            );
          }
        }
      }

      // dots
      const dotGroups = allDotGroups
        .selectAll('g.dot-group')
        .data([...yKeys, 'x'])
        .enter()
        .append('g')
        .attr('class', 'dot-group')
        .attr('opacity', 0);
      dotGroups
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 5)
        .attr('fill', d => COLORS.get(d));
      dotGroups
        .append('text')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('paint-order', 'stroke')
        .attr('y', '-5px')
        .attr('fill', d => COLORS.get(d))
        .attr('stroke', 'rgba(255, 255, 255, 0.5)')
        .attr('stroke-width', 5)
        .attr('filter', textBackgroundURL);

      // mouse move handler
      graph.on('mousemove', (_, index, nodes) => {
        const [xValue] = mouse(nodes[index]);
        const closestIndex =
          Math.round(x.invert(xValue) / precision / step) * precision;
        allDotGroups
          .attr('transform', `translate(${x(closestIndex * step)}, 0)`)
          .attr(
            'opacity',
            closestIndex * step >= xMin && closestIndex * step <= xMax ? 1 : 0,
          );
        allDotGroups
          .selectAll('g.dot-group')
          .attr(
            'transform',
            d =>
              `translate(0, ${
                d === 'x'
                  ? height - MARGIN.bottom
                  : (y(yData[d].data[closestIndex]) || 0) + 2.5
              })`,
          )
          .attr('opacity', d => (d === 'x' || labels[d] ? 1 : 0))
          .selectAll('text')
          .text(d => {
            if (d === 'x') {
              const number =
                closestIndex * step * xScaleFactor + (startsAtOne ? step : 0);
              if (!pdbDataRef.current.file) return +number.toFixed(2);
              const atom = pdbDataRef.current.file.atomMap.get(
                pdbDataRef.current.file.atomStore.atomTypeId[
                  number - (startsAtOne ? step : 0)
                ],
              );
              if (!atom) return +number.toFixed(2);
              const residue = pdbDataRef.current.file.residueMap.get(
                pdbDataRef.current.file.atomStore.residueIndex[
                  number - (startsAtOne ? step : 0)
                ],
              );
              if (!residue) return +number.toFixed(2);
              return `${residue.resname} - ${atom.atomname}`;
            } else {
              return yData[d].data[closestIndex];
            }
          });
        if (onHover) {
          onHover(
            closestIndex * step >= xMin && closestIndex * step <= xMax
              ? closestIndex + (startsAtOne ? step : 0)
              : null,
          );
        }
      });

      if (onSelect) {
        graph.on('click', (_, index, nodes) => {
          const [xValue] = mouse(nodes[index]);
          const closestIndex =
            Math.round(x.invert(xValue) / precision / step) * precision +
            (startsAtOne ? step : 0);
          if (closestIndex * step < xMin || closestIndex * step > xMax) {
            return;
          }
          onSelect(selected => {
            if (!(selected instanceof Set)) {
              return closestIndex === selected ? null : closestIndex;
            }
            const newSet = new Set(selected);
            newSet[newSet.has(closestIndex) ? 'delete' : 'add'](closestIndex);
            return newSet;
          });
        });
      }

      graph.on('mouseout', () => {
        allDotGroups.selectAll('g.dot-group').attr('opacity', 0);
        if (onHover) onHover(null);
      });

      prevLabels.current = labels;
      prevPrecision.current = precision;
      prevRescaleX.current = rescaleX;
    };

    window.addEventListener('resize', drawRef.current);

    return () => window.removeEventListener('resize', drawRef.current);
  }, []);

  useEffect(() => {
    selectedRef.current = selected;
    pdbDataRef.current = pdbData || pdbDataRef.current;
    drawRef.current({ selected, pdbData });
  }, [selected, pdbData]);

  useEffect(() => drawRef.current({ precision: pr, labels: lab }), [pr, lab]);

  const handleChange = useCallback(({ target: { dataset: { key } } }) => {
    if (!key) return;
    setLabels(labels => {
      const nextLabels = { ...labels, [key]: !labels[key] };
      if (Object.values(nextLabels).some(Boolean)) return nextLabels;
      // If all of the values would be false, keep the previous
      return labels;
    });
  }, []);

  const handleMouseOver = useCallback(
    ({
      target: {
        dataset: { key },
      },
    }) => {
      if (!key || type === 'dash' || !lab[key]) return;
      drawRef.current({ hovered: key, precision: pr, labels: lab });
    },
    [pr, lab],
  );

  const handleMouseOut = useCallback(
    ({
      target: {
        dataset: { key },
      },
    }) => {
      if (!key || type === 'dash' || !lab[key]) return;
      drawRef.current({ precision: pr, labels: lab });
    },
    [pr, lab],
  );

  const handleClick = useCallback(() => onSelect(new Set()), []);

  const handlePrecisionChange = useCallback(
    (_, value) => setPrecision(2 ** (9 - value)),
    [],
  );

  return (
    <>
      <div className={style['graph-container']} ref={containerRef} />
      <div className={style['graph-legend']}>
        {yEntries.map(([key]) => (
          <FormControlLabel
            data-key={key}
            key={key}
            onChange={handleChange}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            control={
              <Checkbox
                checked={lab[key]}
                style={{ color: COLORS.get(key) }}
                inputProps={{ 'data-key': key }}
              />
            }
            label={NICE_NAMES.get(key) || key}
          />
        ))}
        {type === 'dash' && (
          <Button
            variant="contained"
            disabled={!selected.size}
            onClick={handleClick}
          >
            <DeleteIcon />
            <span>Clear selection</span>
          </Button>
        )}
      </div>
      {defaultPrecision && (
        <div
          className={cn(style['graph-legend'], style['precision'])}
          title={`Showing ${pr === 1 ? 'all' : `1 out of ${pr}`} data points`}
        >
          <span>Precision:</span>
          <Slider
            value={9 - Math.log2(pr)}
            min={0}
            max={9}
            step={1}
            onChange={handlePrecisionChange}
          />
        </div>
      )}
      <details className={style['graph-legend']}>
        <summary>Graph information</summary>
        <span>
          Displaying observed data (more opaque lines), alongside corresponding
          mean value (light horizontal lines), and mean ± 1σ (lighter horizontal
          bands)
        </span>
      </details>
    </>
  );
};

export default Graph;
