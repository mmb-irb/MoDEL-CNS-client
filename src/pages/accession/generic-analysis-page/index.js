import React, { lazy, Suspense, useState, useRef, useEffect } from 'react';

import { Rnd } from 'react-rnd';
import { Card, CardContent, Typography } from '@material-ui/core';

import useAPI from '../../../hooks/use-api';

import { BASE_PATH } from '../../../utils/constants';

import style from './style.module.css';

const StatisticsTable = lazy(() =>
  import('../../../components/statistics-table'),
);
const Graph = lazy(() => import('../../../components/graph'));
const NGLViewer = lazy(() => import('../../../components/ngl-viewer'));

const defaultPosition = (() => {
  const MARGIN = 10;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const dimension = Math.min(windowWidth / 4, windowHeight / 4);
  return {
    x: windowWidth - dimension - MARGIN,
    y: windowHeight - dimension - MARGIN,
    width: dimension,
    height: dimension,
  };
})();

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
  const rndRef = useRef(null);

  useEffect(() => {
    // imperative way to have rnd component positionned
    rndRef.current &&
      rndRef.current.updatePosition({
        x: defaultPosition.x,
        y: defaultPosition.y,
      });
    // hacky way to have viewer visible (otherwise sometimes it stays blank)
    setTimeout(
      () => nglViewRef.current && nglViewRef.current.autoResize(),
      500,
    );
  }, []);

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
        <Rnd
          className={style.rnd}
          default={defaultPosition}
          bounds="body"
          cancel="canvas"
          onResize={() => nglViewRef.current && nglViewRef.current.autoResize()}
          onResizeStop={() => {
            if (!nglViewRef.current) return;
            nglViewRef.current.autoResize();
            nglViewRef.current.autoResize.flush();
          }}
          ref={rndRef}
        >
          <Card className={style['floating-card']} elevation={4}>
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
        </Rnd>
      )}
    </Suspense>
  );
};

export default Analysis;
