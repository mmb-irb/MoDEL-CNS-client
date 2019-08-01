import React, { lazy, Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { sleep, schedule } from 'timing-functions';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {
  blueGrey as primary,
  lightGreen as secondary,
} from '@material-ui/core/colors';

// Layout
import Body from '../layout/body';
import Main from '../layout/main';

import ErrorBoundary from '../components/error-boundary';

const Header = lazy(() =>
  import(/* webpackChunkName: 'header' */ '../layout/header'),
);
const Footer = lazy(async () => {
  await schedule(100);
  const module = await import(
    /* webpackChunkName: 'footer' */ '../layout/footer'
  );
  await sleep(1000);
  await schedule(500);
  return module;
});

// Pages
const Home = lazy(() => import(/* webpackChunkName: 'home' */ '../pages/home'));
const Browse = lazy(() =>
  import(/* webpackChunkName: 'browse' */ '../pages/browse'),
);
const Accession = lazy(() =>
  import(/* webpackChunkName: 'accession' */ '../pages/accession'),
);
const Contact = lazy(() =>
  import(/* webpackChunkName: 'contact' */ '../pages/contact'),
);

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  overrides: {
    MuiTablePagination: {
      toolbar: {
        justifyContent: 'center',
      },
      spacer: {
        flex: 0,
      },
    },
  },
  palette: { primary, secondary },
});

const Root = () => (
  <MuiThemeProvider theme={theme}>
    <Body>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <Main>
        <ErrorBoundary>
          <Switch>
            <Route
              path="/"
              exact
              render={() => (
                <Suspense fallback={null}>
                  <Home />
                </Suspense>
              )}
            />
            <Route
              path="/contact"
              exact
              render={() => (
                <Suspense fallback={null}>
                  <Contact />
                </Suspense>
              )}
            />
            <Route
              path="/browse"
              exact
              render={props => (
                <Suspense fallback={null}>
                  <Browse {...props} />
                </Suspense>
              )}
            />
            <Redirect
              from="/browse/:accession"
              to="/browse/:accession/overview"
              exact
            />
            <Route
              path="/browse/:accession/:subPage"
              render={props => (
                <Suspense fallback={null}>
                  <Accession match={props.match} />
                </Suspense>
              )}
            />
            <Route render={() => 404} />
          </Switch>
        </ErrorBoundary>
      </Main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </Body>
  </MuiThemeProvider>
);

export default Root;
