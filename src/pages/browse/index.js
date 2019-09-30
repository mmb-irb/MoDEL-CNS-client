import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { parse, stringify } from 'qs';
import cn from 'classnames';
// import { AutoSizer, Table, Column } from 'react-virtualized';
import {
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableFooter,
  Chip,
} from '@material-ui/core';
import { Done } from '@material-ui/icons';

import Card from '../../components/animated-card';
import Highlight from '../../components/highlight';
import LazyImg from '../../components/lazy-img';
import Loading from '../../components/loading';

import useAPI from '../../hooks/use-api';

import { BASE_PATH_PROJECTS, NICE_NAMES } from '../../utils/constants';

import style from './style.module.css';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// define non-changing props
const rowsPerPageOptions = [5, 10, 25, 50];
const backIconButtonProps = { title: 'Previous page' };
const nextIconButtonProps = { title: 'Next page' };

const keyframes = {
  opacity: [0, 1],
  transform: ['translateX(2.5%)', 'translateX(0)'],
};

const Row = ({
  highlight,
  identifier,
  accession,
  published,
  pdbInfo,
  analyses,
  index,
}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!(ref.current && ref.current.animate)) return;

    const animation = ref.current.animate(keyframes, {
      fill: 'both',
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      duration: 750,
      delay: 100 + index * 75,
    });

    return () => animation.cancel();
  }, [index]);

  return (
    <TableRow
      ref={ref}
      className={cn({ [style['not-published']]: !published })}
    >
      {/* accession */}
      <TableCell>
        <Link to={`/browse/${accession || identifier}/overview`}>
          <Highlight highlight={highlight}>
            {accession || identifier}
            {!published && ' (not published)'}
          </Highlight>
        </Link>
      </TableCell>
      {/* PDB accession */}
      <TableCell>
        <Highlight highlight={highlight}>
          {pdbInfo && pdbInfo.identifier}
        </Highlight>
      </TableCell>
      {/* name */}
      <TableCell>
        <Highlight highlight={highlight}>
          {pdbInfo && pdbInfo.compound}
        </Highlight>
      </TableCell>
      {/* membrane */}
      <TableCell>
        <Done />
      </TableCell>
      {/* preview */}
      <TableCell>
        {pdbInfo && pdbInfo.identifier && (
          <LazyImg
            width="150px"
            height="150px"
            src={`//cdn.rcsb.org/images/hd/${pdbInfo.identifier
              .toLowerCase()
              .substr(
                1,
                2,
              )}/${pdbInfo.identifier.toLowerCase()}/${pdbInfo.identifier.toLowerCase()}.0_chimera_tm_350_350.png`}
            loading="lazy"
            alt={`3D view of the ${pdbInfo.identifier.toLowerCase()} structure`}
          />
        )}
      </TableCell>
      {/* analyses */}
      <TableCell>
        {analyses && analyses.length
          ? analyses
              .sort()
              .map(analysis => (
                <Chip
                  key={analysis}
                  clickable
                  className={style.analysis}
                  component={Link}
                  to={`/browse/${accession || identifier}/${analysis}`}
                  label={NICE_NAMES.get(analysis) || analysis}
                  variant="outlined"
                />
              ))
          : null}
      </TableCell>
    </TableRow>
  );
};

const Browse = ({ location, history }) => {
  const search = parse(location.search, { ignoreQueryPrefix: true });

  const searchString = stringify({
    search: search.search,
    page: search.page || DEFAULT_PAGE,
    limit: search.limit || DEFAULT_LIMIT,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [search.page]);

  const ApiUrl = `${BASE_PATH_PROJECTS}?${searchString}`;
  const { loading, payload, error, previousPayload } = useAPI(ApiUrl);

  if (loading && !previousPayload) return <Loading />;
  if (error) {
    console.error(error);
    return 'Something wrong happened';
  }

  if (!loading && !payload) return 'no data';

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHead className={style['table-head']}>
            <TableRow>
              <TableCell>accession</TableCell>
              <TableCell>PDB accession</TableCell>
              <TableCell>name</TableCell>
              <TableCell>membrane</TableCell>
              <TableCell>preview</TableCell>
              <TableCell>analyses</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            className={cn(style['table-body'], { [style.loading]: loading })}
          >
            {(payload || previousPayload).projects.map((project, index) => (
              <Row
                {...project}
                highlight={search.search}
                index={index}
                key={project.identifier}
              />
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                colSpan={6}
                count={(payload || previousPayload).totalCount}
                rowsPerPage={+search.limit || DEFAULT_LIMIT}
                page={(+search.page || DEFAULT_PAGE) - 1}
                onChangePage={(_, page) => {
                  history.push({
                    ...location,
                    search: stringify({
                      search: search.search,
                      page: page + 1 === DEFAULT_PAGE ? undefined : page + 1,
                      limit:
                        !search.limit || +search.limit === DEFAULT_LIMIT
                          ? undefined
                          : +search.limit,
                    }),
                  });
                }}
                onChangeRowsPerPage={({ target: { value } }) => {
                  history.push({
                    ...location,
                    search: stringify({
                      search: search.search,
                      limit: +value === DEFAULT_LIMIT ? undefined : value,
                    }),
                  });
                }}
                backIconButtonProps={backIconButtonProps}
                nextIconButtonProps={nextIconButtonProps}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Browse;
