import React, { useContext, useState, useMemo, lazy, Suspense } from 'react';
import cn from 'classnames';

import { CardContent, Typography } from '@material-ui/core';

import Card from '../../../components/animated-card';
import NGLViewerInDND from '../../../components/ngl-viewer-in-dnd';
import EigenvalueGraph from '../../../components/eigenvalue-graph';
import Loading from '../../../components/loading';

import useAPI from '../../../hooks/use-api';

import { AccessionCtx } from '../../../contexts';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import plainTextExplanation from './plain-text-explanation';
import processStats from './process-stats';

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

const projectionPlaceholder = (
  <div className={cn(style.placeholder, style.projection)} />
);
const nglPlaceholder = (
  <div className={cn(style.placeholder, style['ngl-viewer-with-controls'])} />
);

const PCA = () => {
  const accession = useContext(AccessionCtx);

  const { loading, payload } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/pca/`,
  );

  const [projections, setProjections] = useState([]);
  const [requestedFrame, setRequestedFrame] = useState(null);

  const [explanation, totalEigenvalue] = useMemo(() => {
    setRequestedFrame(null);
    return processStats(payload, projections);
  }, [payload, projections]);

  if (loading) return <Loading />;

  return (
    <>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">PCA eigenvalues</Typography>
          {/* Bars graph which allows to select a specific projection */}
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
          <p>{plainTextExplanation(projections, explanation)}</p>
          {projections.length === 1 && (
            <Suspense fallback={nglPlaceholder}>
              {/* When only 1 frame is selected use the regula ngl viewer */}
              <NGLViewerWithControls
                accession={accession}
                className={style['ngl-viewer-with-controls']}
                projection={projections[0]}
              />
            </Suspense>
          )}
          {projections.length === 2 && (
            <Suspense fallback={projectionPlaceholder}>
              {/* When only 2 frames are selected use the projections graph */}
              <Projections
                step={payload.step}
                data={payload.y}
                projections={projections}
                setRequestedFrame={setRequestedFrame}
              />
            </Suspense>
          )}
          {/* When more than 2 frames are selected display nothing */}
        </CardContent>
      </Card>
      {Number.isFinite(requestedFrame) && (
        // This small viewer is displayed when the user clicks in some point of the Projections graph
        <NGLViewerInDND
          accession={accession}
          requestedFrame={requestedFrame}
          setRequestedFrame={setRequestedFrame}
        />
      )}
    </>
  );
};

export default PCA;
