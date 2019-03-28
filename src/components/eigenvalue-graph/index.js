import React, { useRef, useEffect } from 'react';
import { noop } from 'lodash-es';
import { select, scaleLinear, scaleBand, line, area } from 'd3';

import style from './style.module.css';

const MARGIN = { top: 20, right: 50, bottom: 40, left: 50 };
const MIN_DISPLAY_INDEX = 14; // display at least 14 components
const MIN_DISPLAY_EXPL = 0.8; // display at least components for 80% explanation

const EigenvalueGraph = ({
  data,
  totalEigenvalue,
  projections,
  setProjections,
}) => {
  const containerRef = useRef(null);
  const drawRef = useRef(noop);
  const processedRef = useRef(null);
  const projectionsRef = useRef(projections);

  // should only be run once
  useEffect(() => {
    const graph = select(containerRef.current).append('svg');

    drawRef.current = ({
      processed = processedRef.current,
      projections = projectionsRef.current,
    } = {}) => {
      // container size
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      graph.attr('width', width).attr('height', height);

      // x axis
      const xEigen = scaleBand()
        .domain(processed.map((_, i) => i))
        .range([MARGIN.left, width - MARGIN.right])
        .padding(0.1);

      // explained variance
      // y axis
      const yExpl = scaleLinear()
        .domain([0, 1])
        .range([height - MARGIN.bottom, MARGIN.top])
        .nice();

      // lines
      const lineFn = line()
        .x((_, i) => xEigen(i) + xEigen.bandwidth() / 2)
        .y(yExpl);

      const explLine = graph.selectAll('path.line').data([processed]);
      explLine
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', '#fdd400')
        .attr('stroke-width', 1.5)
        .merge(explLine)
        .attr('d', d => lineFn(d.map(item => item.cumulativeExplained)));

      // areas
      const areaFn = area()
        .x((_, i) => xEigen(i) + xEigen.bandwidth() / 2)
        .y0(height - MARGIN.bottom)
        .y1(d => yExpl(d));

      const explArea = graph.selectAll('path.area').data([processed]);
      explArea
        .enter()
        .append('path')
        .attr('class', 'area')
        .attr('fill', '#fdd400')
        .attr('fill-opacity', 0.1)
        .merge(explArea)
        .attr('d', d => areaFn(d.map(item => item.cumulativeExplained)));

      // eigenvalue
      // y axis
      const yEigen = scaleLinear()
        .domain([0, data['component-1'].eigenvalue])
        .range([height - MARGIN.bottom, MARGIN.top])
        .nice();

      // bars
      const bars = graph.selectAll('rect.bar').data(processed);
      bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('fill-opacity', ({ hasProjection }) => (hasProjection ? 1 : 0.5))
        .on('click', ({ hasProjection }, i) => {
          if (!hasProjection) return;
          setProjections(([one, two]) => (i === two ? [two, one] : [two, i]));
        })
        .merge(bars)
        .attr('x', (_, i) => xEigen(i))
        .attr('width', xEigen.bandwidth())
        .attr('y', d => yEigen(d.eigenvalue))
        .attr('height', d => height - MARGIN.bottom - yEigen(d.eigenvalue))
        .attr('fill', ({ projection }) => (projection ? '#84b761' : '#67b7dc'));

      // bar legends
      const barLegends = graph.selectAll('text.bar-legend').data(projections);
      barLegends
        .enter()
        .append('text')
        .attr('class', 'bar-legend')
        .attr('text-anchor', 'middle')
        .text((_, i) => (i === 0 ? 'x' : 'y'))
        .merge(barLegends)
        .attr('y', () => height - MARGIN.bottom + 16)
        .transition()
        .attr('x', d => xEigen(d) + xEigen.bandwidth() / 2);
    };

    window.addEventListener('resize', drawRef.current);

    return () => window.removeEventListener('resize', drawRef.current);
  }, []);

  // data massaging
  useEffect(() => {
    let acc = 0;
    const processed = [];
    for (const [index, { eigenvalue, data: projectionData }] of Object.values(
      data,
    ).entries()) {
      acc += eigenvalue;
      const cumulativeExplained = acc / totalEigenvalue;
      processed.push({
        cumulativeExplained,
        eigenvalue,
        projection: projections.includes(index),
        hasProjection: !!projectionData,
      });
      if (
        index >= MIN_DISPLAY_INDEX &&
        cumulativeExplained >= MIN_DISPLAY_EXPL
      ) {
        break;
      }
    }

    processedRef.current = processed;
    projectionsRef.current = projections;

    drawRef.current({ processed, projections });
  }, [data, totalEigenvalue, projections]);

  return <div className={style['graph-container']} ref={containerRef} />;
};

export default EigenvalueGraph;
