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
    atom: new Uint32Array(length),
    rmsf: new Float32Array(length),
  };
  for (const [index, line] of lines.entries()) {
    const [atom, rmsf] = line
      .split(MULTIPLE_SPACES_REGEXP)
      .map(Number.parseFloat);
    data.atom[index] = atom;
    data.rmsf[index] = rmsf;
  }
  return { data };
};

const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const colors = {
  rmsf: '#67b7dc',
};
const niceNames = {
  rmsf: 'Fluctuation',
};

export default class Fluctuation extends PureComponent {
  #ref = React.createRef();
  #graph;
  #axes;
  state = {
    data: null,
    labels: {
      rmsf: true,
    },
  };

  #draw = hovered => {
    const { clientWidth: width, clientHeight: height } = this.#ref.current;
    this.#graph.attr('width', width).attr('height', height);

    const yValues = Object.entries(this.state.data).filter(
      ([key]) => key !== 'atom',
    );

    const x = d3
      .scaleLinear()
      .domain([0, this.state.data.atom[this.state.data.atom.length - 1]])
      .range([margin.left, width - margin.right]);
    const xAxis = g =>
      g.attr('transform', `translate(0, ${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0),
      );
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(
          yValues
            .filter(([key]) => this.state.labels[key])
            .map(([, value]) => d3.min(value)),
        ),
        d3.max(
          yValues
            .filter(([key]) => this.state.labels[key])
            .map(([, value]) => d3.max(value)),
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
      .x((_, i) => x(this.state.data.atom[i]))
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
      const closestAtom = Math.floor(
        Math.min(
          Math.max(0, Math.round(x.invert(d3.event.layerX - 25))),
          this.state.data.atom[this.state.data.atom.length - 1],
        ),
      );
      this.#graph
        .selectAll('g.dot-data circle')
        .attr(
          'transform',
          d =>
            `translate(${x(this.state.data.atom[closestAtom])}, ${
              d === 'atom'
                ? height - margin.bottom
                : y(this.state.data[d][closestAtom])
            })`,
        )
        .attr('opacity', 1);
      this.#graph
        .selectAll('g.dot-data text')
        .attr(
          'transform',
          d =>
            `translate(${x(this.state.data.atom[closestAtom])}, ${
              d === 'atom'
                ? height - margin.bottom - 7
                : y(this.state.data[d][closestAtom]) - 7
            })`,
        )
        .text(
          d =>
            d === 'atom'
              ? closestAtom
              : formatter(this.state.data[d][closestAtom]),
        )
        .attr('opacity', 1);
    });
    this.#graph.on('mouseleave', () => {
      this.#graph.selectAll('g.dot-data circle').attr('opacity', 0);
      this.#graph.selectAll('g.dot-data text').attr('opacity', 0);
    });

    const lines = this.#graph
      .selectAll('path.rmsf-data')
      .data(yValues.map(d => d[0]));
    lines
      .enter()
      .append('path')
      .attr('class', ([key]) => `rmsf-data ${key}`)
      .attr('fill', 'none')
      .attr('stroke', d => colors[d])
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .merge(lines)
      .transition()
      .attr('opacity', d => (this.state.labels[d] ? 1 : 0))
      .attr('stroke-width', d => (hovered === d ? 3 : 1.5))
      .attr('d', d => lineFn(this.state.data[d]));

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
    //   .selectAll('path.rmsf-data-avg')
    //   .data(yValues.map(d => d[0]));
    // linesAvg
    //   .enter()
    //   .append('path')
    //   .attr('class', ([key]) => `rmsf-data-avg ${key}`)
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
    const response = await fetch(BASE_PATH + accession + '/md.rmsf.xvg');
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
          .text('Fluctuation (nm)'),
        xLabel: this.#graph
          .append('text')
          .style('text-anchor', 'middle')
          .text('Atom'),
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
                    .filter(([key]) => key !== 'atom')
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
