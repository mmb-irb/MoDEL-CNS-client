import React from 'react';
import { Link } from 'react-router-dom';
import { parse } from 'qs';
import cn from 'classnames';
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
import { Done } from '@material-ui/icons';

import Highlight from '../../components/highlight';

import useAPI from '../../hooks/use-api';

import { BASE_PATH } from '../../utils/constants';

import style from './style.module.css';

export default ({ location }) => {
  const { search } = parse(location.search, { ignoreQueryPrefix: true });

  const ApiUrl = `${BASE_PATH}${search ? `?search=${search}` : ''}`;
  const { loading, payload, error, previousPayload } = useAPI(ApiUrl);

  if (loading && !previousPayload) return 'loading';
  if (error) {
    console.error(error);
    return 'Something wrong happened';
  }

  if (!loading && !payload) return 'no data';

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>accession</TableCell>
              <TableCell>PDB accession</TableCell>
              <TableCell>name</TableCell>
              <TableCell>membrane</TableCell>
              <TableCell>preview</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            className={cn(style['table-body'], { [style.loading]: loading })}
          >
            {(payload || previousPayload).projects.map(
              ({ identifier, pdbInfo }) => (
                <TableRow key={identifier}>
                  <TableCell>
                    <Link to={`/browse/${identifier}/overview`}>
                      <Highlight highlight={search}>{identifier}</Highlight>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Highlight highlight={search}>
                      {pdbInfo && pdbInfo._id}
                    </Highlight>
                  </TableCell>
                  <TableCell>
                    <Highlight highlight={search}>
                      {pdbInfo && pdbInfo.compound}
                    </Highlight>
                  </TableCell>
                  <TableCell>
                    <Done />
                  </TableCell>
                  <TableCell>
                    <img
                      width="150px"
                      height="150px"
                      src={`//cdn.rcsb.org/images/hd/${pdbInfo._id
                        .toLowerCase()
                        .substr(
                          1,
                          2,
                        )}/${pdbInfo._id.toLowerCase()}/${pdbInfo._id.toLowerCase()}.0_chimera_tm_350_350.png`}
                      alt={`3D view of the ${pdbInfo._id.toLowerCase()} structure`}
                    />
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
