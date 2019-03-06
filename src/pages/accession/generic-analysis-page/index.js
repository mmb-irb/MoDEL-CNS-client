import React, {
  lazy,
  Suspense,
  useState,
  useRef,
  useEffect,
  useContext,
} from 'react';

import { Rnd } from 'react-rnd';
import { Card, CardContent, Typography } from '@material-ui/core';

import cn from 'classnames';

import useAPI from '../../../hooks/use-api';

import { AccessionCtx } from '../../../contexts';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import style from './style.module.css';

const StatisticsTable = lazy(() =>
  import(/* webpackChunkName: 'statistics-table' */ '../../../components/statistics-table'),
);
const Graph = lazy(() =>
  import(/* webpackChunkName: 'graph' */ '../../../components/graph'),
);
const NGLViewerWithControls = lazy(() =>
  import(/* webpackChunkName: 'ngl-viewer-with-controls' */ '../../../components/ngl-viewer-with-controls'),
);

const defaultPosition = (() => {
  const MARGIN = 25;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const dimension = Math.min(windowWidth / 4, windowHeight / 4);
  return {
    x: windowWidth - dimension - MARGIN,
    y: windowHeight - 1.5 * dimension - MARGIN,
    width: dimension,
    height: 1.5 * dimension,
  };
})();

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
              onHover={analysis === 'fluctuation' ? setHovered : undefined}
              hovered={hovered}
              onSelect={setSelected}
              selected={selected}
            />
          )}
        </CardContent>
      </Card>
      <Rnd
        className={cn(style.rnd, {
          [style.hidden]:
            analysis !== 'fluctuation' && !Number.isFinite(selected),
        })}
        default={defaultPosition}
        data-rnd
        bounds="body"
        cancel="canvas, [data-popover]"
        onResize={() => nglViewRef.current && nglViewRef.current.autoResize()}
        onResizeStop={() => {
          if (!nglViewRef.current) return;
          nglViewRef.current.autoResize();
          nglViewRef.current.autoResize.flush();
        }}
        ref={rndRef}
      >
        <Card className={style['floating-card']} elevation={4}>
          <Suspense>
            <NGLViewerWithControls
              accession={accession}
              hovered={hovered}
              selected={selected}
              ref={nglViewRef}
              className={style['ngl-viewer-with-controls']}
              startsPlaying={false}
              noTrajectory={analysis !== 'fluctuation'}
              requestedFrame={
                analysis !== 'fluctuation' &&
                Number.isFinite(selected) &&
                selected
              }
            />
          </Suspense>
        </Card>
      </Rnd>
    </Suspense>
  );
};

export default Analysis;
