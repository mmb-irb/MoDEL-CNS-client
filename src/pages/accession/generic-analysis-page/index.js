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
import useToggleState from '../../../hooks/use-toggle-state';

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

const MIN_NGL_DIMENSION = 150;

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

  const [wasDisplayed, toggleWasDisplayed] = useToggleState(false);

  const nglViewRef = useRef(null);
  const rndRef = useRef(null);

  useEffect(() => {
    if (wasDisplayed) return;
    if (selected instanceof Set) {
      if (!selected.size) return;
    } else if (!Number.isFinite(selected)) {
      return;
    }
    toggleWasDisplayed(true);

    const MARGIN = 25;
    const { innerWidth, innerHeight, scrollY } = window;
    const dimension = Math.max(
      Math.min(innerWidth / 4, innerHeight / 4),
      MIN_NGL_DIMENSION,
    );
    rndRef.current.updateSize({
      width: dimension,
      height: 1.25 * dimension,
    });
    rndRef.current.updatePosition({
      x: innerWidth - dimension - MARGIN,
      y: innerHeight - 1.5 * dimension - MARGIN + scrollY,
    });
    // nglViewRef.current && nglViewRef.current.autoResize();
  }, [selected, wasDisplayed]);

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
        {Number.isFinite(selected) || (selected && selected.size) ? (
          <Card className={style['floating-card']} elevation={4}>
            <Suspense fallback={null}>
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
        ) : null}
      </Rnd>
    </Suspense>
  );
};

export default Analysis;
