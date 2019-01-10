import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import Overview from './overview';
import Trajectory from './trajectory';
import RMSd from './rmsd';
import Rgyr from './rgyr';
import Fluctuation from './fluctuation';

import useAPI from '../../hooks/use-api';

import { BASE_PATH } from '../../utils/constants';

const Loading = () => 'Loading';

const Error = ({ error }) => {
  console.error(error);
  return 'Something wrong happened';
};

const SummarySwitch = ({ payload, pdbData }) => {
  return (
    <Switch>
      <Route
        path="/browse/:accession/overview"
        exact
        render={() => <Overview pdbData={payload.pdbInfo} />}
      />
      <Route
        path="/browse/:accession/trajectory"
        exact
        render={props => (
          <Trajectory
            {...props}
            metadata={payload.metadata}
            pdbData={payload.pdbInfo}
          />
        )}
      />
      <Route path="/browse/:accession/rmsd" exact component={RMSd} />
      <Route path="/browse/:accession/rgyr" exact component={Rgyr} />
      <Route
        path="/browse/:accession/fluctuation"
        exact
        component={props => <Fluctuation {...props} pdbData={pdbData} />}
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
