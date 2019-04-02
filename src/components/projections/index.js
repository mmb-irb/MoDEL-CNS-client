import React, { useRef, useEffect } from 'react';
import { noop, zip } from 'lodash-es';
import { select, scaleLinear, axisLeft, axisBottom } from 'd3';

import style from './style.module.css';

const MARGIN = { top: 5, right: 5, bottom: 5, left: 5 };

const Projections = ({ data, projections }) => {
  const containerRef = useRef(null);
  const drawRef = useRef(noop);
  const processedRef = useRef(null);

  useEffect(() => {
    const graph = select(containerRef.current).append('svg');
    const filter = graph
      .append('defs')
      .append('filter')
      .attr('id', 'goo-effect');
    filter
      .append('feGaussianBlur')
      .attr('in', 'SoureGraphic')
      .attr('stdDeviation', 1)
      .attr('result', 'blur');
    filter
      .append('feColorMatrix')
      .attr('in', 'blur')
      .attr('mode', 'matrix')
      .attr('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -7')
      .attr('result', 'goo');
    filter
      .append('feBlend')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'goo');

    const refs = {
      xAxis: graph.append('g').attr('class', style.axis),
      yAxis: graph.append('g').attr('class', style.axis),
      dataPoints: graph.append('g').attr('class', style['data-points']),
    };

    drawRef.current = ({ processed = processedRef.current } = {}) => {
      // container size
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      graph.attr('width', width).attr('height', height);

      // x axis
      const x = scaleLinear()
        .domain(processedRef.current.xMinMax)
        .range([MARGIN.left, width - MARGIN.right]);

      // y axis
      const y = scaleLinear()
        .domain(processedRef.current.yMinMax)
        .range([height - MARGIN.bottom, MARGIN.top]);

      // visual x axis
      const xAxis = g =>
        g
          .attr('transform', `translate(0, ${y(0)})`)
          .call(axisBottom(x).tickFormat(d => (d === 0 ? null : d)));
      refs.xAxis.transition().call(xAxis);

      // visual y axis
      const yAxis = g =>
        g
          .attr('transform', `translate(${x(0)}, 0)`)
          .call(axisLeft(y).tickFormat(d => (d === 0 ? null : d)));
      refs.yAxis.transition().call(yAxis);

      // data points
      const points = refs.dataPoints.selectAll('circle').data(processed.data);
      points
        .enter()
        .append('circle')
        .attr('r', Math.min(width, height) / 250)
        .attr('cx', ([d]) => x(d))
        .attr('cy', ([, d]) => y(d))
        .merge(points)
        .transition()
        .duration(() => 250 + (Math.random() - 0.5) * 500)
        .attr('cx', ([d]) => x(d))
        .attr('cy', ([, d]) => y(d));
    };

    window.addEventListener('resize', drawRef.current);

    return () => window.removeEventListener('resize', drawRef.current);
  }, []);

  useEffect(() => {
    const values = Object.values(data);
    const processed = {
      data: zip(values[projections[0]].data, values[projections[1]].data),
      xMinMax: [values[projections[0]].min, values[projections[0]].max],
      yMinMax: [values[projections[1]].min, values[projections[1]].max],
    };

    processedRef.current = processed;

    drawRef.current({ processed });
  }, [data, projections]);

  return <div className={style['graph-container']} ref={containerRef} />;
};

export default Projections;
