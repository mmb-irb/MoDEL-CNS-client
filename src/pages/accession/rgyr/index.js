import React, { memo } from 'react';

import { Card, CardContent, Typography } from '@material-ui/core';

import StatisticsTable from '../../../components/statistics-table';
import Graph from '../../../components/graph';

import useAPI from '../../../hooks/use-api';

import { BASE_PATH } from '../../../utils/constants';

import style from './style.module.css';

const Rgyr = memo(({ match }) => {
  const { accession } = match.params;
  const { payload } = useAPI(`${BASE_PATH}${accession}/analyses/rgyr/`);

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
            <Graph
              y={payload.y}
              step={payload.step}
              defaultPrecision={2 ** 6}
              xLabel="Time (ns)"
              xScaleFactor={0.001}
              yLabel="Rgyr (nm)"
            />
          )}
        </CardContent>
      </Card>
    </>
  );
});

export default Rgyr;
