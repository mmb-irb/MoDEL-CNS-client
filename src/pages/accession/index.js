import React, { PureComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import Overview from './overview';
import Trajectory from './trajectory';
import RMSd from './rmsd';
import Rgyr from './rgyr';
import Fluctuation from './fluctuation';

const BASE_PATH = 'http://localhost:1337/localhost:5000/';

class Accession extends PureComponent {
  state = {
    ngl: null,
    pdbData: null,
  };

  async componentDidMount() {
    const { accession } = this.props.match.params;
    // (1) load NGL library
    const NGLPromise = import('ngl');
    // (2) query PDB data
    const blobPromise = fetch(BASE_PATH + accession + '/md.imaged.rot.dry.pdb')
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
        {pdbData && (
          <>
            <Typography variant="h5">{pdbData.title}</Typography>
            <Switch marker="here">
              <Route
                path="/browse/:accession/overview"
                exact
                render={props => (
                  <Overview {...props} ngl={ngl} pdbData={pdbData} />
                )}
              />
              <Route
                path="/browse/:accession/trajectory"
                exact
                render={props => (
                  <Trajectory {...props} ngl={ngl} pdbData={pdbData} />
                )}
              />
              <Route path="/browse/:accession/rmsd" exact component={RMSd} />
              <Route path="/browse/:accession/rgyr" exact component={Rgyr} />
              <Route
                path="/browse/:accession/fluctuation"
                exact
                component={Fluctuation}
              />
            </Switch>
          </>
        )}
      </>
    );
  }
}

export default Accession;
