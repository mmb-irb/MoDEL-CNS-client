import React, { PureComponent } from 'react';
import { omit } from 'lodash-es';
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
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';

import { BASE_PATH } from '../../../utils/constants';

import style from './style.module.css';

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
    labels: {
      rg: true,
      rgx: true,
      rgy: true,
      rgz: true,
    },
  };

  #draw = hovered => {
    const { clientWidth: width, clientHeight: height } = this.#ref.current;
    this.#graph.attr('width', width).attr('height', height);

    const yValues = Object.entries(this.state.data).filter(
      ([key]) => key !== 'time',
    );

    const x = d3
      .scaleLinear()
      .domain([0, this.state.data.time[this.state.data.time.length - 1]])
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
          yValues
            .filter(([key]) => this.state.labels[key])
            .map(([, value]) =>
              d3.min(value.filter((_, i) => i % PRECISION === 0)),
            ),
        ),
        d3.max(
          yValues
            .filter(([key]) => this.state.labels[key])
            .map(([, value]) =>
              d3.max(value.filter((_, i) => i % PRECISION === 0)),
            ),
        ),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);
    const yAxis = g =>
      g
        .attr('transform', `translate(${margin.left}, 0)`)
        .transition()
        .call(d3.axisLeft(y).ticks(8, '.2f'));

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

    this.#graph.on('mousemove', () => {
      // this.#axes.yBrush
      //   .attr('opacity', 1)
      //   .attr(
      //     'transform',
      //     `translate(${Math.min(
      //       Math.max(margin.left, d3.event.layerX - 25),
      //       width - margin.right,
      //     )}, 0)`,
      //   );
      const closestTime =
        Math.floor(
          Math.min(
            Math.max(0, Math.round(x.invert(d3.event.layerX - 25))),
            this.state.data.time[this.state.data.time.length - 1],
          ) / PRECISION,
        ) * PRECISION;
      this.#graph
        .selectAll('g.dot-data circle')
        .attr(
          'transform',
          d =>
            `translate(${x(
              this.state.data.time.filter((_, i) => i % PRECISION === 0)[
                Math.round(closestTime / PRECISION / this.state.data.time[1])
              ],
            )}, ${
              d === 'time'
                ? height - margin.bottom
                : y(
                    this.state.data[d].filter((_, i) => i % PRECISION === 0)[
                      Math.round(
                        closestTime / PRECISION / this.state.data.time[1],
                      )
                    ],
                  )
            })`,
        )
        .attr('opacity', 1);
      this.#graph
        .selectAll('g.dot-data text')
        .attr(
          'transform',
          d =>
            `translate(${x(
              this.state.data.time.filter((_, i) => i % PRECISION === 0)[
                Math.round(closestTime / PRECISION / this.state.data.time[1])
              ],
            )}, ${
              d === 'time'
                ? height - margin.bottom - 7
                : y(
                    this.state.data[d].filter((_, i) => i % PRECISION === 0)[
                      Math.round(
                        closestTime / PRECISION / this.state.data.time[1],
                      )
                    ],
                  ) - 7
            })`,
        )
        .text(
          d =>
            d === 'time'
              ? closestTime / 100 / this.state.data.time[1]
              : formatter(
                  this.state.data[d].filter((_, i) => i % PRECISION === 0)[
                    Math.round(
                      closestTime / PRECISION / this.state.data.time[1],
                    )
                  ],
                ),
        )
        .attr('opacity', 1);
    });
    this.#graph.on('mouseleave', () => {
      this.#graph.selectAll('g.dot-data circle').attr('opacity', 0);
      this.#graph.selectAll('g.dot-data text').attr('opacity', 0);
    });

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
      .attr('opacity', d => (this.state.labels[d] ? 1 : 0))
      .attr('stroke-width', d => (hovered === d ? 3 : 1.5))
      .attr('d', d =>
        lineFn(this.state.data[d].filter((_, i) => i % PRECISION === 0)),
      );

    const dotsGroups = this.#graph
      .selectAll('g.dot-data')
      // .data(yValues.map(d => d[0]))
      .data(Object.keys(this.state.data))
      .enter()
      .append('g')
      .attr('class', 'dot-data');
    dotsGroups
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', d => colors[d])
      .attr('opacity', 0);
    dotsGroups
      .append('text')
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('paint-order', 'stroke')
      .attr('fill', d => colors[d])
      .attr('stroke', 'rgba(255, 255, 255, 0.5)')
      .attr('stroke-width', 5)
      .attr('opacity', 0);

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
    //     lineFn.curve(d3.curveBasis)(
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
  };

  #handleChange = ({ currentTarget }) => {
    const { key } = currentTarget.dataset;
    if (!key) return;
    // Keep at least one selected
    if (!Object.values(omit(this.state.labels, key)).some(Boolean)) return;
    this.setState(
      ({ labels }) => ({
        labels: { ...labels, [key]: !labels[key] },
      }),
      () => this.#draw(key),
    );
  };

  #handleMouseOver = ({ currentTarget }) =>
    this.#draw(currentTarget.dataset.key);

  #handleMouseOut = () => this.#draw();

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
    window.addEventListener('resize', this.#draw);
  }

  render() {
    const { data, labels } = this.state;
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
              {Object.entries(labels).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  data-key={key}
                  onChange={this.#handleChange}
                  onMouseOver={this.#handleMouseOver}
                  onMouseOut={this.#handleMouseOut}
                  control={
                    <Checkbox
                      checked={value}
                      style={{ color: colors[key] }}
                      inputProps={{ 'data-key': key }}
                    />
                  }
                  label={niceNames[key]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
}
