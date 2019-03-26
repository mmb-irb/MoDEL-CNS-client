import React, { Suspense, lazy, useContext } from 'react';
import { Switch, Route } from 'react-router-dom';

import { Typography, Button } from '@material-ui/core';
import { Link } from '@material-ui/icons';

import useAPI from '../../hooks/use-api';
import useNGLFile from '../../hooks/use-ngl-file';

import { AccessionCtx, ProjectCtx, PdbCtx } from '../../contexts';

import { BASE_PATH, BASE_PATH_PROJECTS } from '../../utils/constants';

import style from './style.module.css';

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
const PCA = lazy(() => import(/* webpackChunkName: 'pca' */ './pca'));

const loadingSpan = <span>Loading</span>;
const Loading = () => loadingSpan;

const Error = ({ error }) => {
  console.error(error);
  return 'Something wrong happened';
};

const SummarySwitch = () => {
  const accession = useContext(AccessionCtx);

  const { loading, payload, error } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/`,
  );
  const pdbData = useNGLFile(
    `${BASE_PATH_PROJECTS}${accession}/files/md.imaged.rot.dry.pdb`,
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
              path="/browse/:accession/pca"
              exact
              render={() => (
                <Suspense fallback={loadingSpan}>
                  <PCA />
                </Suspense>
              )}
            />
            <Route
              path="/browse/:accession/rmsd"
              exact
              render={() => (
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
              render={() => (
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
              component={() => (
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
            <Route render={() => 404} />
          </Switch>
        </PdbCtx.Provider>
      </ProjectCtx.Provider>
    );
  }

  return <Error error={error || 'something wrong happened'} />;
};

const LinkSwitch = ({ accession, subPage }) => {
  let end;
  switch (subPage) {
    case 'overview':
    case 'trajectory':
      end = '';
      break;
    case 'rgyr':
    case 'rmsd':
    case 'pca':
    case 'fluctuation':
      end = `analyses/${subPage}`;
      break;
    case 'files':
      end = subPage;
      break;
    default:
      end = '';
  }
  return (
    <Button
      component="a"
      target="_blank"
      href={`${BASE_PATH}current/projects/${accession}/${end}`}
      className={style['link-to-api']}
    >
      <Link />
      &nbsp;data in this page
    </Button>
  );
};

export default ({ match }) => (
  <AccessionCtx.Provider value={match.params.accession}>
    <Typography variant="h4">
      Accession: {match.params.accession}
      <LinkSwitch
        accession={match.params.accession}
        subPage={match.params.subPage}
      />
    </Typography>

    <SummarySwitch />
  </AccessionCtx.Provider>
);
