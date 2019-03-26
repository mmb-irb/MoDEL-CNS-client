import React, { useRef, useEffect } from 'react';
import { noop, zip } from 'lodash-es';
import { select, scaleLinear } from 'd3';

import style from './style.module.css';

const MARGIN = { top: 20, right: 30, bottom: 20, left: 30 };

const Projections = ({ data, projections }) => {
  const containerRef = useRef(null);
  const drawRef = useRef(noop);
  const processedRef = useRef(null);

  useEffect(() => {
    const graph = select(containerRef.current).append('svg');

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

      // data points
      const points = graph.selectAll('circle.point').data(processed.data);
      points
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('fill', '#84b761')
        .attr('fill-opacity', 1)
        .attr('r', Math.min(width, height) / 250)
        .attr('cx', ([d]) => x(d))
        .attr('cy', ([, d]) => y(d))
        .merge(points)
        .transition()
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

  useEffect(() => {
    data && drawRef.current();
  }, [data]);

  return <div className={style['graph-container']} ref={containerRef} />;
};

export default Projections;
