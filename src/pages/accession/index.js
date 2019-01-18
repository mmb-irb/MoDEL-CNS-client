import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import useAPI from '../../hooks/use-api';

import { BASE_PATH } from '../../utils/constants';

const Overview = lazy(() =>
  import(/* webpackChunkName: 'overview' */ './overview'),
);
const Trajectory = lazy(() =>
  import(/* webpackChunkName: 'trajectory' */ './trajectory'),
);
const GenericAnalysisPage = lazy(() =>
  import(/* webpackChunkName: 'generic-analysis-page' */ './generic-analysis-page'),
);

const loading = <span>Loading</span>;
const Loading = () => loading;

const Error = ({ error }) => {
  console.error(error);
  return 'Something wrong happened';
};

const SummarySwitch = ({ payload }) => {
  return (
    <Switch>
      <Route
        path="/browse/:accession/overview"
        exact
        render={() => (
          <Suspense fallback={loading}>
            <Overview pdbData={payload.pdbInfo} />
          </Suspense>
        )}
      />
      <Route
        path="/browse/:accession/trajectory"
        exact
        render={props => (
          <Suspense fallback={loading}>
            <Trajectory {...props} metadata={payload.metadata} />
          </Suspense>
        )}
      />
      <Route
        path="/browse/:accession/rmsd"
        exact
        render={props => (
          <Suspense fallback={loading}>
            <GenericAnalysisPage
              analysis="rmsd"
              defaultPrecision={2 ** 6}
              xLabel="Time (ns)"
              xScaleFactor={0.001}
              yLabel="RMSd (nm)"
              {...props}
            />
          </Suspense>
        )}
      />
      <Route
        path="/browse/:accession/rgyr"
        exact
        render={props => (
          <Suspense fallback={loading}>
            <GenericAnalysisPage
              analysis="rgyr"
              defaultPrecision={2 ** 6}
              xLabel="Time (ns)"
              xScaleFactor={0.001}
              yLabel="Rgyr (nm)"
              {...props}
            />
          </Suspense>
        )}
      />
      <Route
        path="/browse/:accession/fluctuation"
        exact
        component={props => (
          <Suspense fallback={loading}>
            <GenericAnalysisPage
              analysis="fluctuation"
              xLabel="Atom"
              yLabel="Fluctuation (nm)"
              startsAtOne
              graphType="dash"
              {...props}
            />
          </Suspense>
        )}
      />
    </Switch>
  );
};

export default ({ match }) => {
  const { accession } = match.params;

  const { loading, payload, error } = useAPI(`${BASE_PATH}${accession}/`);

  return (
    <>
      <Typography variant="h4">Accession: {accession}</Typography>
      {loading && <Loading />}
      {error && <Error error={error} />}
      {payload && <SummarySwitch payload={payload} />}
    </>
  );
};
