import React, { PureComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import Overview from './overview';
import Trajectory from './trajectory';
import RMSd from './rmsd';
import Rgyr from './rgyr';
import Fluctuation from './fluctuation';

import useAPI from '../../hooks/use-api';

import { BASE_PATH } from '../../utils/constants';
import accessionToPDBAccession from '../../utils/accession-to-pdb-accession';

const Loading = () => 'Loading';

const Error = ({ error }) => {
  console.error(error);
  return 'Something wrong happened';
};

const SummarySwitch = ({ payload }) => {
  // return JSON.stringify(payload, null, 2);
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
      {/* <Route path="/browse/:accession/rmsd" exact component={RMSd} />
      <Route path="/browse/:accession/rgyr" exact component={Rgyr} />
      <Route
        path="/browse/:accession/fluctuation"
        exact
        component={props => <Fluctuation {...props} pdbData={pdbData} />}
      /> */}
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

class Accession extends PureComponent {
  state = {
    ngl: null,
    pdbData: null,
  };

  async componentDidMount() {
    const { accession } = this.props.match.params;
    const pdbAccession = accessionToPDBAccession(accession);
    // (1) load NGL library
    const NGLPromise = import('ngl');
    // (2) query PDB data
    const blobPromise = fetch(
      BASE_PATH +
        accession +
        (accession.endsWith('_mb')
          ? '/md.imaged.rot.dry.pdb'
          : `/${pdbAccession}.dry.pdb`),
    )
      // (2) and load in memory
      .then(response => response.blob());
    // do (1) & (2) in parallel, wait for both to finish
    const [ngl, blob] = await Promise.all([NGLPromise, blobPromise]);
    this.setState({
      ngl,
      pdbData: await ngl.autoLoad(blob, {
        defaultRepresentation: false,
        ext: 'pdb',
      }),
    });
  }

  componentWillUnmount() {
    if (this.state.stage) this.state.stage.dispose();
  }

  render() {
    const { ngl, pdbData } = this.state;
    return (
      <>
        <Typography variant="h4">
          Accession: {this.props.match.params.accession}
        </Typography>
        {pdbData && <></>}
      </>
    );
  }
}
