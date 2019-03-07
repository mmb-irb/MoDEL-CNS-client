import React, { useState, useEffect, useCallback } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { parse, stringify } from 'qs';
import { debounce } from 'lodash-es';

import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import { BASE_PATH } from '../../utils/constants';

import style from './style.module.css';

const DEBOUNCE_DELAY = 500;

const updateLocation = debounce((history, location, search, value) => {
  const { search: _search, ...nextSearchObject } = parse(search, {
    ignoreQueryPrefix: true,
  });
  const shouldReplace = Boolean(_search) === Boolean(value);
  if (value) nextSearchObject.search = value;
  if (_search === value) return;
  history[shouldReplace ? 'replace' : 'push']({
    ...location,
    search: stringify(nextSearchObject),
  });
}, DEBOUNCE_DELAY);

const Search = props => {
  const {
    location: { search },
    history,
    location,
  } = props;

  const [value, setValue] = useState(
    parse(search, { ignoreQueryPrefix: true }).search,
  );

  // make sure to cancel any upcoming location update if component unmounts
  useEffect(() => updateLocation.cancel, []);

  const handleChange = useCallback(({ target: { value } }) => {
    setValue(value);

    updateLocation(history, location, search, value);
  }, []);

  return (
    <>
      <Icon>
        <SearchIcon className={value && style['search-active']} />
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
              variant="scrollable"
              scrollButtons="auto"
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
                to={`/browse/${accession}/files`}
                label="files"
                value="files"
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
