import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { keyBy, escapeRegExp } from 'lodash-es';
import { parse } from 'qs';
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

import Highlight from '../../components/highlight';

import accessionToPDBAccession from '../../utils/accession-to-pdb-accession';
import mounted from '../../utils/mounted';

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

const shouldBeFiltered = (accession, extra, search) => {
  if (!search) return false;
  const re = new RegExp(escapeRegExp(search), 'i');
  if (re.test(accession)) return false;
  if (!extra) return false;
  for (const value of Object.values(extra)) {
    if (typeof value === 'string' && re.test(value)) return false;
  }
  return true;
};

export default class Browse extends PureComponent {
  state = { data: null, pdbData: null };

  async componentDidMount() {
    mounted.add(this);

    const response1 = await fetch('http://localhost:1337/localhost:5000/', {
      headers: { Accept: 'application/json' },
    });
    const wholeData = await response1.json();
    const data = wholeData.files
      .map(info => info.name.toLowerCase())
      .filter(name => /^[a-z0-9]{4}_/.test(name));
    if (!mounted.has(this)) return;
    this.setState({ data });

    const response2 = await fetch(
      `https://www.rcsb.org/pdb/json/describePDB?structureId=${data
        .map(accessionToPDBAccession)
        .join(',')}`,
      {
        headers: { Accept: 'application/json' },
      },
    );
    const pdbData = await response2.json();
    if (!mounted.has(this)) return;
    this.setState({
      pdbData: keyBy(pdbData, datum => datum.structureId.toLowerCase()),
    });
  }

  componentWillUnmount() {
    mounted.delete(this);
  }

  render() {
    if (!this.state.data) return null;
    const pdbData = this.state.pdbData || {};
    const { search } = parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    return (
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>accession</TableCell>
                <TableCell>PDB accession</TableCell>
                <TableCell>name</TableCell>
                <TableCell>preview</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.data.map(accession => {
                const PDBAccession = accessionToPDBAccession(accession);
                const extra = pdbData[PDBAccession];
                if (shouldBeFiltered(accession, extra, search)) return null;
                return (
                  <TableRow key={accession}>
                    <TableCell>
                      <Link to={`/browse/${accession}/overview`}>
                        <Highlight highlight={search}>{accession}</Highlight>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Highlight highlight={search}>
                        {extra && extra.structureId}
                      </Highlight>
                    </TableCell>
                    <TableCell>
                      <Highlight highlight={search}>
                        {extra && extra.title}
                      </Highlight>
                    </TableCell>
                    <TableCell>
                      <img
                        width="150px"
                        height="150px"
                        src={`//cdn.rcsb.org/images/hd/${PDBAccession.substr(
                          1,
                          2,
                        )}/${PDBAccession}/${PDBAccession}.0_chimera_tm_350_350.png`}
                        alt={`3D view of the ${PDBAccession} structure`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}
