import React, { PureComponent } from 'react';
import { debounce } from 'lodash-es';
import * as d3 from 'd3';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';

import style from './style.module.css';

const BASE_PATH = 'http://localhost:1337/localhost:5000/';
const COMMENT_REGEXP = /^[@#]/;
const MULTIPLE_SPACES_REGEXP = / +/g;
const formatter = d3.format('.4f');

const rawTextToData = raw => {
  const lines = raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !COMMENT_REGEXP.test(line));
  const { length } = lines;
  const data = {
    time: new Uint32Array(length),
    rg: new Float32Array(length),
    rgx: new Float32Array(length),
    rgy: new Float32Array(length),
    rgz: new Float32Array(length),
  };
  for (const [index, line] of lines.entries()) {
    const [time, rg, rgx, rgy, rgz] = line
      .split(MULTIPLE_SPACES_REGEXP)
      .map(Number.parseFloat);
    data.time[index] = time;
    data.rg[index] = rg;
    data.rgx[index] = rgx;
    data.rgy[index] = rgy;
    data.rgz[index] = rgz;
  }
  return { data };
};

const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const colors = {
  rg: '#67b7dc',
  rgx: '#fdd400',
  rgy: '#84b761',
  rgz: '#cc4748',
};
const niceNames = {
  rg: 'Rgyr',
  rgx: 'RgyrX',
  rgy: 'RgyrY',
  rgz: 'RgyrZ',
};

const PRECISION = 100;

export default class Rgyr extends PureComponent {
  #ref = React.createRef();
  #graph;
  #axes;
  state = {
    data: null,
  };

  // debounce and schedule this call to avoid redrawing too often unecessarily
  #draw = debounce(hovered => {
    const { clientWidth: width, clientHeight: height } = this.#ref.current;
    this.#graph.attr('width', width).attr('height', height);

    const yValues = Object.entries(this.state.data).filter(
      ([key]) => key !== 'time',
    );

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(this.state.data.time)])
      .range([margin.left, width - margin.right]);
    const xAxis = g =>
      g.attr('transform', `translate(0, ${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
          .tickFormat(d => d / 1e3),
      );
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(
          yValues.map(([, value]) =>
            d3.min(value.filter((_, i) => i % PRECISION === 0)),
          ),
        ),
        d3.max(
          yValues.map(([, value]) =>
            d3.max(value.filter((_, i) => i % PRECISION === 0)),
          ),
        ),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);
    const yAxis = g =>
      g
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(8, '.1f'))
        .call(g => g.select('.domain').remove());

    const lineFn = d3
      .line()
      .x((_, i) => x(this.state.data.time[i * PRECISION]))
      .y(d => y(d));

    // draw axes
    this.#axes.x.call(xAxis);
    this.#axes.y.call(yAxis);
    this.#axes.xLabel.attr(
      'transform',
      `translate(${width / 2}, ${height - 5})`,
    );
    this.#axes.yLabel.attr('y', 0).attr('x', 0 - height / 2);

    const lines = this.#graph
      .selectAll('path.rg-data')
      .data(yValues.map(d => d[0]));
    lines
      .enter()
      .append('path')
      .attr('class', ([key]) => `rg-data ${key}`)
      .attr('fill', 'none')
      .attr('stroke', d => colors[d])
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .merge(lines)
      .transition()
      .attr('stroke-width', d => (hovered === d ? 3 : 1.5))
      .attr('d', d =>
        lineFn(this.state.data[d].filter((_, i) => i % PRECISION === 0)),
      );

    // const linesAvg = this.#graph
    //   .selectAll('path.rg-data-avg')
    //   .data(yValues.map(d => d[0]));
    // linesAvg
    //   .enter()
    //   .append('path')
    //   .attr('class', ([key]) => `rg-data-avg ${key}`)
    //   .attr('fill', 'none')
    //   .attr('stroke', d => colors[d])
    //   .attr('opacity', 0.5)
    //   .attr('stroke-linejoin', 'round')
    //   .attr('stroke-linecap', 'round')
    //   .merge(linesAvg)
    //   .transition()
    //   .attr('stroke-width', d => (hovered === d ? 3 : 1.5))
    //   .attr('d', d =>
    //     lineFn(
    //       Float32Array.from(
    //         {
    //           length: Math.floor(this.state.data[d].length / PRECISION),
    //         },
    //         (_, i) =>
    //           d3.mean(
    //             this.state.data[d].slice(
    //               i * PRECISION,
    //               i * PRECISION + PRECISION,
    //             ),
    //           ),
    //       ),
    //     ),
    //   );
  }, 500);

  #handleMouseOver = ({ currentTarget }) => {
    this.#draw(currentTarget.dataset.key);
    this.#draw.flush();
  };

  #handleMouseOut = () => {
    this.#draw();
    this.#draw.flush();
  };

  async componentDidMount() {
    const { accession } = this.props.match.params;
    const response = await fetch(BASE_PATH + accession + '/md.rgyr.xvg');
    const processed = rawTextToData(await response.text());
    this.setState({ ...processed }, () => {
      if (!this.#ref.current) return;
      this.#graph = d3.select(this.#ref.current).append('svg');
      this.#axes = {
        x: this.#graph.append('g'),
        y: this.#graph.append('g'),
        yLabel: this.#graph
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text('Rgyr (nm)'),
        xLabel: this.#graph
          .append('text')
          .style('text-anchor', 'middle')
          .text('Time (ns)'),
      };
      this.#draw();
      window.addEventListener('resize', this.#draw);
    });
  }

  componentWillUnmount() {
    this.#draw.cancel();
    window.addEventListener('resize', this.#draw);
  }

  render() {
    const { data } = this.state;
    return (
      <>
        <Card className={style.card}>
          <CardContent>
            <Typography variant="h6">Statistics</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>name</TableCell>
                  <TableCell>mean</TableCell>
                  <TableCell>standard deviation</TableCell>
                </TableRow>
              </TableHead>
              {data && (
                <TableBody>
                  {Object.entries(data)
                    .filter(([key]) => key !== 'time')
                    .map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>
                          {formatter(d3.mean(value))}
                          nm
                        </TableCell>
                        <TableCell>
                          {formatter(d3.deviation(value))}
                          nm
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              )}
            </Table>
          </CardContent>
        </Card>
        <Card className={style.card}>
          <CardContent>
            <Typography variant="h6">Graph</Typography>
            <div className={style['graph-container']} ref={this.#ref} />
            <div className={style['graph-legend']}>
              {data &&
                Array.from(Object.keys(data))
                  .filter(key => key !== 'time')
                  .map(key => (
                    <span
                      key={key}
                      data-key={key}
                      onMouseOver={this.#handleMouseOver}
                      onMouseOut={this.#handleMouseOut}
                    >
                      <span
                        className={style['color-block']}
                        style={{ color: colors[key] }}
                      />
                      <span>{niceNames[key]}</span>
                    </span>
                  ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
}
