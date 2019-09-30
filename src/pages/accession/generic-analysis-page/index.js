import React, { lazy, Suspense, useState, useContext } from 'react';

import { Card, CardContent, Typography } from '@material-ui/core';

import NGLViewerInDND from '../../../components/ngl-viewer-in-dnd';
import Loading from '../../../components/loading';

import useAPI from '../../../hooks/use-api';

import { AccessionCtx } from '../../../contexts';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import style from './style.module.css';

const StatisticsTable = lazy(() =>
  import(
    /* webpackChunkName: 'statistics-table' */ '../../../components/statistics-table'
  ),
);
const Graph = lazy(() =>
  import(/* webpackChunkName: 'graph' */ '../../../components/graph'),
);

const Analysis = ({
  analysis,
  defaultPrecision,
  xLabel,
  xScaleFactor,
  yLabel,
  graphType,
  startsAtOne,
}) => {
  const accession = useContext(AccessionCtx);

  const { loading, payload } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/${analysis}/`,
  );

  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(
    analysis === 'fluctuation' ? new Set() : null,
  );

  const showDND = !!(
    (typeof selected === 'number' && Number.isFinite(selected)) ||
    (selected && selected.size)
  );

  return (
    <Suspense fallback={<Loading />}>
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
              onHover={analysis === 'fluctuation' ? setHovered : undefined}
              hovered={hovered}
              onSelect={setSelected}
              selected={selected}
            />
          )}
        </CardContent>
      </Card>
      {showDND && (
        <NGLViewerInDND
          accession={accession}
          hovered={hovered}
          analysis={analysis}
          selected={selected}
          setSelected={setSelected}
        />
      )}
    </Suspense>
  );
};

export default Analysis;
