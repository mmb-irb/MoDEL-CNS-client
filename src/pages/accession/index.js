import React, { Suspense, lazy, useContext } from 'react';
import { Switch, Route } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import useAPI from '../../hooks/use-api';
import useNGLFile from '../../hooks/use-ngl-file';

import { AccessionCtx, ProjectCtx, PdbCtx } from '../../contexts';

import { BASE_PATH } from '../../utils/constants';

const Overview = lazy(() =>
  import(/* webpackChunkName: 'overview' */ './overview'),
);
const Files = lazy(() => import(/* webpackChunkName: 'files' */ './files'));
const Trajectory = lazy(() =>
  import(/* webpackChunkName: 'trajectory' */ './trajectory'),
);
const GenericAnalysisPage = lazy(() =>
  import(/* webpackChunkName: 'generic-analysis-page' */ './generic-analysis-page'),
);

const loadingSpan = <span>Loading</span>;
const Loading = () => loadingSpan;

const Error = ({ error }) => {
  console.error(error);
  return 'Something wrong happened';
};

const SummarySwitch = () => {
  const accession = useContext(AccessionCtx);

  const { loading, payload, error } = useAPI(`${BASE_PATH}${accession}/`);
  const pdbData = useNGLFile(
    `${BASE_PATH}${accession}/files/md.imaged.rot.dry.pdb`,
    { defaultRepresentation: false, ext: 'pdb' },
  );

  if (loading) return <Loading />;
  if (payload) {
    return (
      <ProjectCtx.Provider value={payload}>
        <PdbCtx.Provider value={pdbData}>
          <Switch>
            <Route
              path="/browse/:accession/overview"
              exact
              render={() => (
                <Suspense fallback={loadingSpan}>
                  <Overview />
                </Suspense>
              )}
            />
            <Route
              path="/browse/:accession/files"
              exact
              render={() => (
                <Suspense fallback={loadingSpan}>
                  <Files />
                </Suspense>
              )}
            />
            <Route
              path="/browse/:accession/trajectory"
              exact
              render={props => (
                <Suspense fallback={loadingSpan}>
                  <Trajectory {...props} />
                </Suspense>
              )}
            />
            <Route
              path="/browse/:accession/rmsd"
              exact
              render={props => (
                <Suspense fallback={loadingSpan}>
                  <GenericAnalysisPage
                    analysis="rmsd"
                    defaultPrecision={2 ** 6}
                    xLabel="Time (ns)"
                    xScaleFactor={0.001}
                    yLabel="RMSd (nm)"
                  />
                </Suspense>
              )}
            />
            <Route
              path="/browse/:accession/rgyr"
              exact
              render={props => (
                <Suspense fallback={loadingSpan}>
                  <GenericAnalysisPage
                    analysis="rgyr"
                    defaultPrecision={2 ** 6}
                    xLabel="Time (ns)"
                    xScaleFactor={0.001}
                    yLabel="Rgyr (nm)"
                  />
                </Suspense>
              )}
            />
            <Route
              path="/browse/:accession/fluctuation"
              exact
              component={props => (
                <Suspense fallback={loadingSpan}>
                  <GenericAnalysisPage
                    analysis="fluctuation"
                    xLabel="Atom"
                    yLabel="Fluctuation (nm)"
                    startsAtOne
                    graphType="dash"
                  />
                </Suspense>
              )}
            />
          </Switch>
        </PdbCtx.Provider>
      </ProjectCtx.Provider>
    );
  }

  return <Error error={error || 'something wrong happened'} />;
};

export default ({ match }) => (
  <AccessionCtx.Provider value={match.params.accession}>
    <Typography variant="h4">Accession: {match.params.accession}</Typography>
    <SummarySwitch />
  </AccessionCtx.Provider>
);
