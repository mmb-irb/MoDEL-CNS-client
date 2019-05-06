import React, { useState, useEffect, useCallback } from 'react';
import { parse, stringify } from 'qs';
import { debounce } from 'lodash-es';

import Icon from '@material-ui/core/Icon';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

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

  const handleChange = useCallback(
    ({ target: { value } }) => {
      setValue(value);

      updateLocation(history, location, search, value);
    },
    [history, location, search],
  );

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

export default Search;
