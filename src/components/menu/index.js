import React, { lazy, Suspense } from 'react';

import { Link, Switch, Route } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import { BASE_PATH } from '../../utils/constants';

import style from './style.module.css';

const ProjectMenu = lazy(() =>
  import(/* webpackChunkName: 'project-menu' */ './project-menu'),
);

const Search = lazy(() => import(/* webpackChunkName: 'search' */ './search'));

export default () => (
  <menu className={style.menu}>
    <div className={style.main}>
      <Button component={Link} color="inherit" to="/">
        Home
      </Button>
      <Button component={Link} color="inherit" to="/browse">
        Browse
      </Button>
      <Button disabled component={Link} color="inherit" to="/preview">
        Preview
      </Button>
      <Button disabled component={Link} color="inherit" to="/help">
        Help
      </Button>
      <Button component={Link} color="inherit" to="/contact">
        Contact
      </Button>
      <Button
        component="a"
        color="inherit"
        href={`${BASE_PATH}docs/`}
        target="_blank"
      >
        REST API
      </Button>
      <Switch>
        <Route
          path="/browse"
          exact
          render={props => (
            <Suspense fallback={null}>
              <Search {...props} />
            </Suspense>
          )}
        />
      </Switch>
    </div>
    <Switch>
      <Route
        path="/browse/:accession/:subPage"
        exact
        render={props => (
          <Suspense fallback={null}>
            <ProjectMenu params={props.match.params} />
          </Suspense>
        )}
      />
    </Switch>
  </menu>
);
