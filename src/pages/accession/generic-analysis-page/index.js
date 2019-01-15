import React, { lazy, Suspense, useState } from 'react';

import { Card, CardContent, Typography } from '@material-ui/core';

import useAPI from '../../../hooks/use-api';

import { BASE_PATH } from '../../../utils/constants';

import style from './style.module.css';

const StatisticsTable = lazy(() =>
  import('../../../components/statistics-table'),
);
const Graph = lazy(() => import('../../../components/graph'));
const NGLViewer = lazy(() => import('../../../components/ngl-viewer'));

const Analysis = ({
  match,
  analysis,
  defaultPrecision,
  xLabel,
  xScaleFactor,
  yLabel,
  graphType,
  startsAtOne,
}) => {
  const { accession } = match.params;
  const { loading, payload } = useAPI(
    `${BASE_PATH}${accession}/analyses/${analysis}/`,
  );
  const [hovered, setHovered] = useState(null);

  return (
    <Suspense fallback={<span>Loading</span>}>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">Statistics</Typography>
          {!loading && payload && <StatisticsTable y={payload.y} />}
        </CardContent>
      </Card>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6" />
          {!loading && payload && (
            <Graph
              y={payload.y}
              step={payload.step}
              defaultPrecision={defaultPrecision}
              xLabel={xLabel}
              xScaleFactor={xScaleFactor}
              yLabel={yLabel}
              type={graphType}
              startsAtOne={startsAtOne}
              onHover={setHovered}
            />
          )}
        </CardContent>
      </Card>
      {analysis === 'fluctuation' && (
        <Card className={style['floating-card']}>
          <CardContent className={style['floating-card-content']}>
            <Suspense>
              <NGLViewer
                accession={accession}
                noTrajectory
                hovered={hovered}
                membraneOpacity={0.5}
              />
            </Suspense>
          </CardContent>
        </Card>
      )}
    </Suspense>
  );
};

export default Analysis;
