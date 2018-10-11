import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import style from './style.module.css';

export default () => (
  <menu>
    <div className={style.main}>
      <Button component={Link} color="inherit" to="/">
        Home
      </Button>
      <Button component={Link} color="inherit" to="/browse">
        Browse
      </Button>
      <Button component={Link} color="inherit" to="/help">
        Help
      </Button>
      <Button component={Link} color="inherit" to="/contact">
        Contact
      </Button>
      <Switch>
        <Route path="/browse" exact>
          <>
            <Icon>
              <SearchIcon />
            </Icon>
            <TextField />
          </>
        </Route>
      </Switch>
    </div>
    <Switch>
      <Route path="/browse/:accession/:subPage" exact>
        {({ match }) => {
          const { accession, subPage } = match.params;
          return (
            <Tabs
              value={subPage}
              indicatorColor="secondary"
              textColor="secondary"
            >
              <Tab
                component={Link}
                to={`/browse/${accession}/overview`}
                label="overview"
                value="overview"
              />
              <Tab
                component={Link}
                to={`/browse/${accession}/trajectory`}
                label="trajectory"
                value="trajectory"
              />
              <Tab
                component={Link}
                to={`/browse/${accession}/rmsd`}
                label="rmsd"
                value="rmsd"
              />
              <Tab
                component={Link}
                to={`/browse/${accession}/rgyr`}
                label="rgyr"
                value="rgyr"
              />
            </Tabs>
          );
        }}
      </Route>
    </Switch>
  </menu>
);
