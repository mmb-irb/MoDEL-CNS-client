import React, { lazy, Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { sleep, schedule } from 'timing-functions';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import lightGreen from '@material-ui/core/colors/lightGreen';

// Layout
import Body from '../layout/body';
import Main from '../layout/main';
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
const PreviewSubmit = lazy(() =>
  import(/* webpackChunkName: 'preview-submit' */ '../pages/preview-submit'),
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
  palette: {
    primary: blueGrey,
    secondary: lightGreen,
  },
});

const Root = () => (
  <MuiThemeProvider theme={theme}>
    <Body>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <Main>
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
          <Route
            path="/(preview|submit)"
            exact
            render={props => (
              <Suspense fallback={null}>
                <PreviewSubmit
                  {...props}
                  submitMode={props.match.params[0] === 'submit'}
                />
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
      </Main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </Body>
  </MuiThemeProvider>
);

export default Root;
