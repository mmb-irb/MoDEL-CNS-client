import React, { lazy, Suspense, useState, useRef } from 'react';

import Draggable from 'react-draggable';
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
  const [selected, setSelected] = useState(new Set());
  const nglViewRef = useRef(null);

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
              hovered={hovered}
              onSelect={setSelected}
              selected={selected}
            />
          )}
        </CardContent>
      </Card>
      {analysis === 'fluctuation' && (
        <Draggable
          cancel={`.${style['floating-card-content']} > *`}
          bounds="body"
        >
          <Card className={style['floating-card']} elevation={4} draggable>
            <CardContent className={style['floating-card-content']}>
              <Suspense>
                <NGLViewer
                  accession={accession}
                  playing
                  hovered={hovered}
                  selected={selected}
                  membraneOpacity={0.5}
                  ref={nglViewRef}
                />
              </Suspense>
            </CardContent>
          </Card>
        </Draggable>
      )}
    </Suspense>
  );
};

export default Analysis;
