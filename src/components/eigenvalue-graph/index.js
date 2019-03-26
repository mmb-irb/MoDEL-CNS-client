import React, { useRef, useEffect } from 'react';
import { noop } from 'lodash-es';
import { select, scaleLinear, scaleBand, line, area } from 'd3';

import style from './style.module.css';

const MARGIN = { top: 20, right: 50, bottom: 40, left: 50 };
const MIN_DISPLAY_INDEX = 14; // display at least 14 components
const MIN_DISPLAY_EXPL = 0.8; // display at least components for 80% explanation

const EigenvalueGraph = ({ data, projections, setProjections }) => {
  const containerRef = useRef(null);
  const drawRef = useRef(noop);
  const processedRef = useRef(null);

  // should only be run once
  useEffect(() => {
    const graph = select(containerRef.current).append('svg');

    drawRef.current = ({ processed = processedRef.current } = {}) => {
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
        .on('click', (_, i) => {
          setProjections(([one, two]) => (i === two ? [two, one] : [two, i]));
        })
        .merge(bars)
        .attr('x', (_, i) => xEigen(i))
        .attr('width', xEigen.bandwidth())
        .attr('y', d => yEigen(d.eigenvalue))
        .attr('height', d => height - MARGIN.bottom - yEigen(d.eigenvalue))
        .attr('fill', ({ projection }) => (projection ? '#84b761' : '#67b7dc'));
    };

    window.addEventListener('resize', drawRef.current);

    return () => window.removeEventListener('resize', drawRef.current);
  }, []);

  // data massaging
  useEffect(() => {
    const eigenvalueTotal = Object.values(data).reduce(
      (acc, { eigenvalue }) => acc + eigenvalue,
      0,
    );

    let acc = 0;
    const processed = [];
    for (const [index, { eigenvalue }] of Object.values(data).entries()) {
      acc += eigenvalue;
      const cumulativeExplained = acc / eigenvalueTotal;
      processed.push({
        cumulativeExplained,
        eigenvalue,
        projection: projections.includes(index),
      });
      if (
        index >= MIN_DISPLAY_INDEX &&
        cumulativeExplained >= MIN_DISPLAY_EXPL
      ) {
        break;
      }
    }

    processedRef.current = processed;

    drawRef.current({ processed });
  }, [data, projections]);

  return <div className={style['graph-container']} ref={containerRef} />;
};

export default EigenvalueGraph;
