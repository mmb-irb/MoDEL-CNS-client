import React, { PureComponent, useCallback } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { parse, stringify } from 'qs';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import style from './style.module.css';

const Search = props => {
  const {
    location: { search },
    history,
    location,
  } = props;
  const value = parse(search, { ignoreQueryPrefix: true }).search;

  const handleChange = useCallback(({ target: { value } }) => {
    const { search: _search, ...nextSearchObject } = parse(search, {
      ignoreQueryPrefix: true,
    });
    const shouldReplace = Boolean(_search) === Boolean(value);
    if (value) nextSearchObject.search = value;
    history[shouldReplace ? 'replace' : 'push']({
      ...location,
      search: stringify(nextSearchObject),
    });
  });

  return (
    <>
      <Icon>
        <SearchIcon className={value && style.magnifying} />
      </Icon>
      <TextField
        value={value || ''}
        onChange={handleChange}
        className={style.search}
      />
    </>
  );
};

export default () => (
  <menu>
    <div className={style.main}>
      <Button component={Link} color="inherit" to="/">
        Home
      </Button>
      <Button component={Link} color="inherit" to="/browse">
        Browse
      </Button>
      {/* <Button component={Link} color="inherit" to="/help">
        Help
      </Button> */}
      <Button component={Link} color="inherit" to="/contact">
        Contact
      </Button>
      <Switch>
        <Route path="/browse" exact component={Search} />
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
                className={style['tab-link']}
              />
              <Tab
                component={Link}
                to={`/browse/${accession}/trajectory`}
                label="trajectory"
                value="trajectory"
                className={style['tab-link']}
              />
              <Tab
                component={Link}
                to={`/browse/${accession}/rmsd`}
                label="rmsd"
                value="rmsd"
                className={style['tab-link']}
              />
              <Tab
                component={Link}
                to={`/browse/${accession}/rgyr`}
                label="rgyr"
                value="rgyr"
                className={style['tab-link']}
              />
              <Tab
                component={Link}
                to={`/browse/${accession}/fluctuation`}
                label="fluctuation"
                value="fluctuation"
                className={style['tab-link']}
              />
            </Tabs>
          );
        }}
      </Route>
    </Switch>
  </menu>
);
