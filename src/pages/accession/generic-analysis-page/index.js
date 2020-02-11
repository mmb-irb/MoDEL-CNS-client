import React, { lazy, Suspense, useState, useContext } from 'react';

import { CardContent, Typography } from '@material-ui/core';

import Card from '../../../components/animated-card';
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
  // Get the accession
  const accession = useContext(AccessionCtx);
  // Send a request to the API with the url of the specific analysis
  const { loading, payload, error } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/${analysis}/`,
  );

  // React hooks
  // Set when the mouse is over the graph
  const [hovered, setHovered] = useState(null);
  // Set when one point in the graph is selected
  const [selected, setSelected] = useState(
    analysis === 'fluctuation' ? new Set() : null,
  );
  // Render loading or error messages according with the API response
  if (loading) return <Loading />;
  else if (error) return error.toString();
  else if (!payload) return 'Something bad happened';

  // Check if there are selected
  const showDND = !!(
    (typeof selected === 'number' && Number.isFinite(selected)) ||
    (selected && selected.size)
  );

  // Render
  return (
    <Suspense fallback={<Loading />}>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">Statistics</Typography>
          <StatisticsTable y={payload.y} />
        </CardContent>
      </Card>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6" />
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
