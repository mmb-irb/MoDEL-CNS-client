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
} from 'd3';
import cn from 'classnames';

import { FormControlLabel, Checkbox } from '@material-ui/core';
import { Slider } from '@material-ui/lab';

import { NICE_NAMES, COLORS } from '../../utils/constants';

import style from './style.module.css';

const MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };

const LineGraph = ({ y: yData, step = 1, startsAtOne = false }) => {
  const containerRef = useRef(null);
  const drawRef = useRef(noop);

  const yEntries = Object.entries(yData);
  const yKeys = yEntries.map(([key]) => key);
  const [lab, setLabels] = useState(
    fromPairs(yEntries.map(([key]) => [key, true])),
  );
  const [pr, setPrecision] = useState(64);

  const prevPrecision = useRef(pr);

  useEffect(() => {
    const graph = select(containerRef.current).append('svg');
    // text background
    const filter = graph
      .append('defs')
      .append('filter')
      .attr('x', 0)
      .attr('y', 0.2)
      .attr('width', 1)
      .attr('height', 0.6)
      .attr('id', 'background');
    filter.append('feFlood').attr('flood-color', 'white');
    filter.append('feComposite').attr('in', 'SourceGraphic');
    const axes = {
      x: graph.append('g'),
      y: graph.append('g'),
      yLabel: graph
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('RMSd (nm)'),
      xLabel: graph
        .append('text')
        .style('text-anchor', 'middle')
        .text('Time (ns)'),
    };
    const allDotGroups = graph.append('g');

    drawRef.current = ({ hovered, precision = pr, labels = lab } = {}) => {
      console.log('drawing!');
      if (hovered) console.log(`hovered: ${hovered}`);
      // container size
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      graph.attr('width', width).attr('height', height);

      // x axis
      const x = scaleLinear()
        .domain([
          0,
          yEntries[0][1].data.length * step - (startsAtOne ? 0 : step),
        ])
        .range([MARGIN.left, width - MARGIN.right])
        .clamp(true);
      const xAxis = g =>
        g.attr('transform', `translate(0, ${height - MARGIN.bottom})`).call(
          axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
            .tickFormat(d => d / 1e3),
        );
      axes.x.call(xAxis);
      axes.xLabel.attr('transform', `translate(${width / 2}, ${height - 5})`);

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
      axes.yLabel.attr('y', 0).attr('x', 0 - height / 2);

      // lines
      const lineFn = line()
        .x((_, i, { length }) => x(i * step * precision))
        .y(d => y(d));
      const lines = graph.selectAll('path.line').data(yKeys);
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
        // deactivate transition if precision changes because
        // the interpolation is misleading
        .duration(() => (prevPrecision.current === precision ? 250 : 0))
        .attr('d', d =>
          lineFn(yData[d].data.filter((_, i) => i % precision === 0)),
        )
        .attr('opacity', d => (labels[d] ? 1 : 0))
        .attr('stroke-width', d => (hovered === d ? 3 : 1.5));

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

      graph.on('mousemove', (_, index, nodes) => {
        const [xValue] = mouse(nodes[index]);
        const closestIndex =
          Math.round(x.invert(xValue) / precision / step) * precision;
        allDotGroups.attr(
          'transform',
          `translate(${x(closestIndex * step)}, 0)`,
        );
        allDotGroups
          .selectAll('g.dot-group')
          .attr(
            'transform',
            d =>
              `translate(0, ${
                d === 'time'
                  ? height - MARGIN.bottom
                  : y(yData[d].data[closestIndex])
              })`,
          )
          .attr('opacity', d => (d === 'time' || labels[d] ? 1 : 0))
          .selectAll('text')
          .text(d =>
            d === 'time'
              ? (closestIndex * step) / 1000
              : yData[d].data[closestIndex],
          );
      });

      graph.on('mouseout', () =>
        allDotGroups.selectAll('g.dot-group').attr('opacity', 0),
      );

      prevPrecision.current = precision;
    };

    window.addEventListener('resize', drawRef.current);

    return () => window.removeEventListener('resize', drawRef.current);
  }, []);

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
            onMouseOver={useCallback(
              () => drawRef.current({ hovered: key }),
              [],
            )}
            onMouseOut={useCallback(() => drawRef.current(), [])}
            control={
              <Checkbox
                checked={lab[key]}
                style={{ color: COLORS.get(key) }}
                inputProps={{ 'data-key': key }}
              />
            }
            label={NICE_NAMES.get(key)}
          />
        ))}
      </div>
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
    </>
  );
};

export default LineGraph;
