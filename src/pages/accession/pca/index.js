import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  lazy,
  Suspense,
} from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { sleep, schedule } from 'timing-functions';
import cn from 'classnames';

import { Rnd } from 'react-rnd';

import EigenvalueGraph from '../../../components/eigenvalue-graph/index';

import useAPI from '../../../hooks/use-api/index';
import useToggleState from '../../../hooks/use-toggle-state/index';

import { AccessionCtx } from '../../../contexts';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import style from './style.module.css';

const NGLViewerWithControls = lazy(() =>
  import(/* webpackChunkName: 'ngl-viewer-with-controls' */ '../../../components/ngl-viewer-with-controls'),
);
const Projections = lazy(() =>
  import(/* webpackChunkName: 'projections' */ '../../../components/projections'),
);

const MIN_NGL_DIMENSION = 150;

const projectionPlaceholder = <div style={{ height: 'calc(50vh + 6em)' }} />;
const nglPlaceholder = (
  <div
    style={{
      background: 'black',
      width: 'calc(100% - 2em)',
      height: 'calc(100% - 4em)',
      margin: '1em 1em 3em 1em',
    }}
  />
);

const PCA = () => {
  const accession = useContext(AccessionCtx);

  const { loading, payload } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/pca/`,
  );

  const [projections, setProjections] = useState([0, 1]);
  const [selected, setSelected] = useState(null);

  const [hadEnoughTime, toggleHadEnoughTime] = useToggleState(false);
  const [wasDisplayed, toggleWasDisplayed] = useToggleState(null);

  const nglViewRef = useRef(null);
  const rndRef = useRef(null);

  const [explanation, totalEigenvalue] = useMemo(() => {
    if (!payload) return [];
    const values = Object.values(payload.y);
    const totalEigenvalue = values.reduce(
      (acc, component) => acc + component.eigenvalue,
      0,
    );
    const explanation =
      (values[projections[0]].eigenvalue + values[projections[1]].eigenvalue) /
      totalEigenvalue;
    return [explanation, totalEigenvalue];
  }, [payload, projections]);

  useEffect(() => {
    let stillMounted = true;
    sleep(100)
      .then(() => schedule(1000))
      .then(() => {
        if (!stillMounted) return;
        toggleHadEnoughTime();
      });
    return () => (stillMounted = false);
  }, []);

  useEffect(() => {
    if (wasDisplayed || !Number.isFinite(selected)) return;
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

  if (loading) return 'loading';

  return (
    <>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">PCA eigenvalues</Typography>
          <EigenvalueGraph
            data={payload.y}
            totalEigenvalue={totalEigenvalue}
            projections={projections}
            setProjections={setProjections}
          />
        </CardContent>
      </Card>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">PCA projections</Typography>
          <p>
            Showing principal components {projections[0] + 1} ↔ and{' '}
            {projections[1] + 1} ↕, accounting for{' '}
            {Math.round(explanation * 1000) / 10}% of explained variance
          </p>
          {hadEnoughTime ? (
            <Suspense fallback={projectionPlaceholder}>
              <Projections
                step={payload.step}
                data={payload.y}
                projections={projections}
                setSelected={setSelected}
              />
            </Suspense>
          ) : (
            projectionPlaceholder
          )}
        </CardContent>
      </Card>
      <Rnd
        className={cn(style.rnd, {
          [style.hidden]: !Number.isFinite(selected),
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
        {Number.isFinite(selected) && (
          <Card className={style['floating-card']} elevation={4}>
            <Suspense fallback={nglPlaceholder}>
              <NGLViewerWithControls
                accession={accession}
                ref={nglViewRef}
                className={style['ngl-viewer-with-controls']}
                startsPlaying={false}
                noTrajectory
                requestedFrame={Number.isFinite(selected) && selected}
              />
            </Suspense>
          </Card>
        )}
      </Rnd>
    </>
  );
};

export default PCA;
