import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
// import { AutoSizer, Table, Column } from 'react-virtualized';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';

/*
<AutoSizer>
  {({ height, width }) => (
    <Table
      width={width}
      height={height}
      headerHeight={20}
      rowCount={data.length}
      rowGetter={({ index }) => data[index]}
      rowHeight={20}
    >
      <Column
        label="Accession"
        dataKey="accession"
        width={100}
        cellRenderer={({ cellData }) => (
          <Link to={`/browse/${cellData}/overview`}>
            {cellData}
          </Link>
        )}
      />
    </Table>
  )}
</AutoSizer>
*/

export default class Browse extends PureComponent {
  state = { data: null };

  async componentDidMount() {
    const response = await fetch('http://localhost:1337/localhost:5000/', {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    this.setState({
      data: data.files
        .map(info => info.name)
        .filter(name => /^\w{4}_/.test(name)),
    });
  }

  render() {
    if (!this.state.data) return null;
    return (
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>accession</TableCell>
                <TableCell>name</TableCell>
                <TableCell>preview</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.data.map(datum => (
                <TableRow key={datum}>
                  <TableCell>
                    <Link to={`/browse/${datum}/overview`}>{datum}</Link>
                  </TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}
