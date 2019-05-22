import React, { useContext, useState, useMemo, lazy, Suspense } from 'react';
import cn from 'classnames';

import { Card, CardContent, Typography } from '@material-ui/core';

import NGLViewerInDND from '../../../components/ngl-viewer-in-dnd/index';

import EigenvalueGraph from '../../../components/eigenvalue-graph/index';

import useAPI from '../../../hooks/use-api/index';

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
          <p>{plainTextExplanation(projections, explanation)}</p>
          {projections.length === 1 && (
            <Suspense fallback={nglPlaceholder}>
              <NGLViewerWithControls
                accession={accession}
                className={style['ngl-viewer-with-controls']}
                projection={projections[0]}
              />
            </Suspense>
          )}
          {projections.length === 2 && (
            <Suspense fallback={projectionPlaceholder}>
              <Projections
                step={payload.step}
                data={payload.y}
                projections={projections}
                setRequestedFrame={setRequestedFrame}
              />
            </Suspense>
          )}
        </CardContent>
      </Card>
      {Number.isFinite(requestedFrame) && (
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
