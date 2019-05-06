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
import { sleep } from 'timing-functions';
import cn from 'classnames';
import { round } from 'lodash-es';

import { Rnd } from 'react-rnd';

import EigenvalueGraph from '../../../components/eigenvalue-graph/index';

import useAPI from '../../../hooks/use-api/index';
import useToggleState from '../../../hooks/use-toggle-state/index';

import { AccessionCtx } from '../../../contexts';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import style from './style.module.css';

const NGLViewerWithControls = lazy(() =>
  import(
    /* webpackChunkName: 'ngl-viewer-with-controls' */ '../../../components/ngl-viewer-with-controls'
  ),
);
const Projections = lazy(() =>
  import(
    /* webpackChunkName: 'projections' */ '../../../components/projections'
  ),
);

const MIN_NGL_DIMENSION = 150;

const projectionPlaceholder = (
  <div className={cn(style.placeholder, style.projection)} />
);
const nglPlaceholder = (
  <div className={cn(style.placeholder, style['ngl-viewer-with-controls'])} />
);

const PlainTextExplanation = ({ projections, explanation }) => {
  if (!projections.length) {
    return `No projection selected, please select one or multiple projections to
    visualise its related data. Only the darker blue bars correspond to
    projections for which data has been calculated.`;
  }
  let projectionText;
  if (projections.length === 1) {
    projectionText = projections[0] + 1;
  } else if (projections.length === 2) {
    projectionText = `${projections[0] + 1} and ${projections[1] + 1}`;
  } else {
    projectionText = projections.reduce(
      (acc, projection, i, { length }) =>
        `${acc}${acc ? ',' : ''}${i === length - 1 ? ' and' : ''} ${projection +
          1}`,
      '',
    );
  }
  return `Selected principal component${
    projections.length > 1 ? 's' : ''
  } ${projectionText}, accounting for ${round(
    explanation * 100,
    1,
  )}% of explained variance`;
};

const PCA = () => {
  const accession = useContext(AccessionCtx);

  const { loading, payload } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/pca/`,
  );

  const [projections, setProjections] = useState([]);
  const [selected, setSelected] = useState(null);

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
      projections.reduce(
        (acc, projection) => acc + values[projection].eigenvalue,
        0,
      ) / totalEigenvalue;

    setSelected(null);
    return [explanation, totalEigenvalue];
  }, [payload, projections]);

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
    sleep(250).then(
      () => nglViewRef.current && nglViewRef.current.centerFocus(),
    );
  }, [selected, wasDisplayed, toggleWasDisplayed]);

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
            <PlainTextExplanation
              projections={projections}
              explanation={explanation}
            />
          </p>
          {projections.length === 1 && (
            <Suspense fallback={nglPlaceholder}>
              <NGLViewerWithControls
                accession={accession}
                className={style['ngl-viewer-with-controls']}
                startsPlaying={false}
                noTrajectory
                requestedFrame={1}
              />
            </Suspense>
          )}
          {projections.length === 2 && (
            <Suspense fallback={projectionPlaceholder}>
              <Projections
                step={payload.step}
                data={payload.y}
                projections={projections}
                setSelected={setSelected}
              />
            </Suspense>
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
