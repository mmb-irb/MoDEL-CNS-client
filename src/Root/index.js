import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import lightGreen from '@material-ui/core/colors/lightGreen';

// Layout
import Body from '../layout/body';
import Header from '../layout/header';
import Main from '../layout/main';
import Footer from '../layout/footer';

// pages
import Home from '../pages/home';
import Browse from '../pages/browse';
import Accession from '../pages/accession';
import Contact from '../pages/contact';

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
      <Header />
      <Main>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/contact" exact component={Contact} />
          <Route path="/browse" exact component={Browse} />
          <Redirect
            from="/browse/:accession"
            to="/browse/:accession/overview"
            exact
          />
          <Route path="/browse/:accession/:subPage" component={Accession} />
          <Route render={() => 404} />
        </Switch>
      </Main>
      <Footer />
    </Body>
  </MuiThemeProvider>
);

export default Root;
