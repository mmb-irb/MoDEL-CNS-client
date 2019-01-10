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

import StatisticsTable from '../../../components/statistics-table';
import LineGraph from '../../../components/line-graph';

import useAPI from '../../../hooks/use-api/index';
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

class _Fluctuation extends PureComponent {
  #ref = React.createRef();
  #zoom;
  #svg;
  #graph;
  #axes;
  #translateX = 0;
  #scale = 1;
  #zoomedX;
  state = {
    data: null,
    labels: {
      rmsf: true,
    },
  };

  #draw = hovered => {
    const { clientWidth: width, clientHeight: height } = this.#ref.current;
    this.#svg.attr('width', width).attr('height', height);

    const yValues = Object.entries(this.state.data).filter(
      ([key]) => key !== 'atom',
    );

    const x = d3
      .scaleLinear()
      .domain([0, this.state.data.atom[this.state.data.atom.length - 1]])
      .range([margin.left, width - margin.right]);
    const _xAxis = d3
      .axisBottom(x)
      .ticks(width / 80)
      .tickSizeOuter(0);
    const xAxis = g =>
      g
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(_xAxis);
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

    this.#svg.on('mousemove', () => {
      const closestAtom = Math.floor(
        Math.min(
          Math.max(
            0,
            Math.floor((this.#zoomedX || x).invert(d3.event.layerX - 25)),
          ),
          this.state.data.atom[this.state.data.atom.length - 1],
        ),
      );
      this.#graph
        .selectAll('g.dot-data rect')
        .attr(
          'transform',
          d =>
            `translate(${(this.#zoomedX || x)(
              this.state.data.atom[closestAtom],
            )}, ${
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
            `translate(${(this.#zoomedX || x)(
              this.state.data.atom[closestAtom],
            )}, ${
              d === 'atom'
                ? height - margin.bottom - 7
                : y(this.state.data[d][closestAtom]) - 7
            })`,
        )
        .text(d => {
          if (d !== 'atom') return formatter(this.state.data[d][closestAtom]);
          const atom = this.props.pdbData.atomMap.get(
            this.props.pdbData.atomStore.atomTypeId[closestAtom],
          );
          if (!atom) return closestAtom + 1;
          return `${closestAtom + 1}: ${atom.atomname} - ${atom.element}`;
        })
        .attr('opacity', 1);
    });
    this.#svg.on('mouseleave', () => {
      this.#graph.selectAll('g.dot-data rect').attr('opacity', 0);
      this.#graph.selectAll('g.dot-data text').attr('opacity', 0);
    });

    const lines = this.#graph
      .selectAll('path.rmsf-data')
      .data(yValues.map(d => d[0]));
    lines
      .enter()
      .append('path')
      .attr('class', key => `rmsf-data ${key}`)
      .attr('fill', 'none')
      .attr('stroke', d => colors[d])
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .merge(lines)
      .transition()
      // .attr('opacity', d => (this.state.labels[d] ? 1 : 0))
      .attr('stroke-width', d => (hovered === d ? 3 : 1.5))
      .attr('d', d => lineFn(this.state.data[d]));

    //   const dataPointGroups = this.#graph
    //   .selectAll('g.rmsf-data')
    //   .data(yValues.map(d => d[0]))
    //   .enter()
    //   .append('g')
    //   .attr('class', ([key]) => `rmsf-data ${key}`);
    // const dataPoints = dataPointGroups.selectAll('circle').data(yValues[0][1]);
    // dataPoints
    //   .enter()
    //   .append('circle')
    //   .attr('r', 1)
    //   .attr('fill', colors.rmsf)
    //   .style('paint-order', 'stroke')
    //   .attr('stroke', 'rgba(0, 0, 0, 0.5)')
    //   .attr('stroke-width', 1)
    //   .merge(dataPoints)
    //   .transition()
    //   .attr('cx', (_, i) => x(i))
    //   .attr('cy', d => y(d));
    const dataPointGroups = this.#graph
      .selectAll('g.rmsf-data')
      .data(yValues.map(d => d[0]))
      .enter()
      .append('g')
      .attr('class', ([key]) => `rmsf-data ${key}`)
      .attr('fill', colors.rmsf)
      .style('paint-order', 'stroke')
      .attr('stroke', 'rgba(0, 0, 0, 0.5)')
      .attr('stroke-width', 1);
    const dataPoints = dataPointGroups.selectAll('circle').data(yValues[0][1]);
    dataPoints
      .enter()
      .append('rect')
      .attr('height', 1)
      .attr('width', 1)
      .merge(dataPoints)
      .transition()
      .attr('x', (_, i) => x(i))
      .attr('y', d => y(d));

    const dotsGroups = this.#graph
      .selectAll('g.dot-data')
      // .data(yValues.map(d => d[0]))
      .data(Object.keys(this.state.data))
      .enter()
      .append('g')
      .attr('class', 'dot-data');
    dotsGroups
      .append('rect')
      .attr('x', -1)
      .attr('y', -2.5)
      .attr('height', 5)
      .attr('width', 1)
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

    // this.#zoom.scaleExtent([1, (4 * this.state.data.atom.length) / width]);
    this.#zoom
      .scaleExtent([1, +Infinity])
      .translateExtent([[margin.left, 0], [width - margin.right, 1]])
      .extent([[margin.left, 0], [width - margin.right, 1]]);
    // this.#zoom.translateExtent([
    //   [-margin.left, margin.bottom],
    //   [width - margin.right, height - margin.top],
    // ]);
    this.#zoom.on('zoom', () => {
      this.#translateX = d3.event.transform.x;
      this.#scale = d3.event.transform.k;
      this.#zoomedX = d3.event.transform.rescaleX(x);
      this.#axes.x.call(_xAxis.scale(this.#zoomedX));
      this.#graph
        .selectAll('g.rmsf-data rect')
        .transition()
        .attr('x', (_, i) => this.#zoomedX(i))
        .attr('width', (_, i) => this.#zoomedX(i + 1) - this.#zoomedX(i));
      this.#graph
        .selectAll('g.dot-data rect')
        .transition()
        .attr('width', this.#zoomedX(2) - this.#zoomedX(1))
        .attr('x', -this.#zoomedX(2) + this.#zoomedX(1));
    });
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
    this.#zoom = d3.zoom();
    this.setState({ ...processed }, () => {
      if (!this.#ref.current) return;
      this.#svg = d3.select(this.#ref.current).append('svg');
      this.#svg.call(this.#zoom);
      this.#graph = this.#svg.append('g');
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

const Fluctuation = ({ match }) => {
  const { accession } = match.params;
  const { payload } = useAPI(`${BASE_PATH}${accession}/analyses/fluctuation`);

  if (payload) console.log(payload);

  return (
    <>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">Statistics</Typography>
          {payload && <StatisticsTable y={payload.y} />}
        </CardContent>
      </Card>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6" />
          {payload && (
            <LineGraph
              y={payload.y}
              step={payload.step}
              xLabel="Atom"
              yLabel="Fluctuation (nm)"
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Fluctuation;
