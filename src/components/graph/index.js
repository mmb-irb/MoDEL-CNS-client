import React, { useState, useCallback, useRef, useEffect } from 'react';
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

import { NICE_NAMES, COLORS } from '../../utils/constants';

import style from './style.module.css';

const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };

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
  pdbData,
}) => {
  const containerRef = useRef(null);
  const drawRef = useRef(noop);
  const selectedRef = useRef(new Set());
  const pdbDataRef = useRef({});

  const yEntries = Object.entries(yData);
  const yKeys = yEntries.map(([key]) => key);
  const [lab, setLabels] = useState(fromPairs(yKeys.map(key => [key, true])));
  const [pr, setPrecision] = useState(defaultPrecision || 1);

  const prevPrecision = useRef(pr);
  const prevRescaleX = useRef(scale => scale);

  useEffect(
    () => {
      drawRef.current && pdbData && pdbData.file && drawRef.current();
    },
    [pdbData],
  );

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
    const filter = defs
      .append('filter')
      .attr('x', 0)
      .attr('y', 0.2)
      .attr('width', 1)
      .attr('height', 0.6)
      .attr('id', 'background');
    filter.append('feFlood').attr('flood-color', 'white');
    filter.append('feComposite').attr('in', 'SourceGraphic');

    {
      // mask opacity
      const leftMaskGradient = defs
        .append('linearGradient')
        .attr('id', 'gradient-left');
      leftMaskGradient
        .append('stop')
        .attr('offset', '0%')
        .style('stop-color', 'white')
        .style('stop-opacity', '1');
      leftMaskGradient
        .append('stop')
        .attr('offset', '100%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
      const rightMaskGradient = defs
        .append('linearGradient')
        .attr('id', 'gradient-right');
      rightMaskGradient
        .append('stop')
        .attr('offset', '0%')
        .style('stop-color', 'white')
        .style('stop-opacity', '0');
      rightMaskGradient
        .append('stop')
        .attr('offset', '100%')
        .style('stop-color', 'white')
        .style('stop-opacity', '1');
    }

    const main = graph.append('g');
    const allDotGroups = graph.append('g');

    // order is important, everything before that will be hidden by masks
    // masks
    graph
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', MARGIN.left)
      .attr('height', '100%')
      .style('fill', 'url(#gradient-left)');
    const maskRight = graph
      .append('rect')
      .attr('y', 0)
      .attr('height', '100%')
      .style('fill', 'url(#gradient-right)');

    // axes
    const axes = {
      x: graph.append('g'),
      y: graph.append('g'),
    };

    // zoom
    const graphZoom = zoom().scaleExtent([1, 50]);
    graph.call(graphZoom);
    graphZoom.on('zoom', () => {
      allDotGroups.selectAll('g.dot-group').attr('opacity', 0);
      drawRef.current({
        rescaleX: event.transform.rescaleX.bind(event.transform),
        noDataTransition: true,
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
      labels = lab,
      rescaleX = prevRescaleX.current,
      noDataTransition,
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

      maskRight.attr('x', width - MARGIN.right).attr('width', MARGIN.right);

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
          .attr('opacity', 0.5)
          .merge(meanLines)
          .attr('x1', x(xMin))
          .attr('x2', x(xMax))
          .attr('y1', d => y(yData[d].average))
          .attr('y2', d => y(yData[d].average));
      }
      // mean ± 1σ area
      if (standardDeviation) {
        const sdRects = main.selectAll('rect.sd').data(yKeys);
        sdRects
          .enter()
          .append('rect')
          .attr('class', 'sd')
          .attr('fill', d => COLORS.get(d))
          .attr('opacity', 0.1)
          .merge(sdRects)
          .attr('x', x(xMin))
          .attr('width', x(xMax) - x(xMin))
          .attr('y', d => y(yData[d].average + yData[d].stddev))
          .attr(
            'height',
            d =>
              y(yData[d].average - yData[d].stddev) -
              y(yData[d].average + yData[d].stddev),
          );
      }

      if (type === 'line') {
        // lines
        const lineFn = line()
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
          .transition()
          // deactivate transition if precision changes or if zooming/panning
          // because the interpolation is weird
          .duration(() =>
            noDataTransition || prevPrecision.current !== precision ? 0 : 250,
          )
          .attr('d', d =>
            lineFn(yData[d].data.filter((_, i) => i % precision === 0)),
          )
          .attr('opacity', d => {
            if (!labels[d]) return 0;
            return type === 'dash' ? 0.25 : 1;
          })
          .attr('stroke-width', d => (hovered === d ? 3 : 1.5));
      } else if (type === 'dash' && canvasContext) {
        const dashWidth = Math.max(1, x(1) - x(0));
        const dashHeight = 5;
        const minIndex = Math.floor(x.invert(0));
        const maxIndex = Math.ceil(x.invert(width));
        canvasContext.clearRect(0, 0, width, height);
        for (const [key, { data }] of yEntries) {
          if (!labels[key]) continue;
          canvasContext.fillStyle = 'rgb(200, 200, 200)';
          // selected areas
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
        .data([...yKeys, 'time'])
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
        .attr('filter', 'url(#background)');

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
                d === 'time'
                  ? height - MARGIN.bottom
                  : y(yData[d].data[closestIndex]) + 2.5
              })`,
          )
          .attr('opacity', d => (d === 'time' || labels[d] ? 1 : 0))
          .selectAll('text')
          .text(d => {
            if (d === 'time') {
              const number =
                closestIndex * step * xScaleFactor + (startsAtOne ? step : 0);
              if (!pdbDataRef.current.file) return number;
              const atom = pdbDataRef.current.file.atomMap.get(
                pdbDataRef.current.file.atomStore.atomTypeId[
                  number - (startsAtOne ? step : 0)
                ],
              );
              if (!atom) return number;
              return `${number}: ${atom.atomname} - ${atom.element}`;
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

      prevRescaleX.current = rescaleX;
      prevPrecision.current = precision;
    };

    window.addEventListener('resize', drawRef.current);

    return () => window.removeEventListener('resize', drawRef.current);
  }, []);

  useEffect(
    () => {
      selectedRef.current = selected;
      pdbDataRef.current = pdbData || pdbDataRef.current;
      drawRef.current({ selected, pdbData });
    },
    [selected, pdbData],
  );

  useEffect(() => drawRef.current({ precision: pr, labels: lab }), [pr, lab]);

  return (
    <>
      <div className={style['graph-container']} ref={containerRef} />
      <div className={style['graph-legend']}>
        {yEntries.map(([key]) => (
          <FormControlLabel
            key={key}
            onChange={useCallback(
              () =>
                setLabels(labels => {
                  const nextLabels = { ...labels, [key]: !labels[key] };
                  if (Object.values(nextLabels).some(Boolean))
                    return nextLabels;
                  // If all of the values would be false, keep the previous
                  return labels;
                }),
              [],
            )}
            onMouseOver={
              type === 'dash'
                ? undefined
                : useCallback(
                    () =>
                      lab[key] &&
                      drawRef.current({
                        hovered: key,
                        precision: pr,
                        labels: lab,
                      }),
                    [pr, lab],
                  )
            }
            onMouseOut={
              type === 'dash'
                ? undefined
                : useCallback(
                    () =>
                      lab[key] &&
                      drawRef.current({ precision: pr, labels: lab }),
                    [pr, lab],
                  )
            }
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
            onClick={useCallback(() => onSelect(new Set()), [])}
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
            onChange={useCallback(
              (_, value) => setPrecision(2 ** (9 - value)),
              [],
            )}
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
