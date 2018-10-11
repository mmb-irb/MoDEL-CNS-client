import React, { PureComponent } from 'react';
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
import * as d3 from 'd3';

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
  return data;
};

export default class Rgyr extends PureComponent {
  state = {
    data: null,
  };

  async componentDidMount() {
    const { accession } = this.props.match.params;
    const response = await fetch(BASE_PATH + accession + '/md.rgyr.xvg');
    this.setState({
      data: rawTextToData(await response.text()),
    });
  }

  render() {
    const { data } = this.state;
    return (
      <Card>
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
                  .filter(([key]) => key.startsWith('rg'))
                  .map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{formatter(d3.mean(value))}Å</TableCell>
                      <TableCell>{formatter(d3.deviation(value))}Å</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>
    );
  }
}
