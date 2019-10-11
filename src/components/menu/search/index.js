import React, { useState, useEffect, useCallback } from 'react';
import { parse, stringify } from 'qs';
import { debounce } from 'lodash-es';

import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import style from './style.module.css';

const DEBOUNCE_DELAY = 500;

// define non-changing props
const inputProps = { 'aria-label': 'Search projects by text' };

export const updateLocation = (history, value) => {
  const { search, ...nextSearchObject } = parse(history.location.search, {
    ignoreQueryPrefix: true,
  });
  const shouldReplace = Boolean(search) === Boolean(value);
  if (value) nextSearchObject.search = value;
  if (search === value) return;
  history[shouldReplace ? 'replace' : 'push']({
    ...history.location,
    search: stringify(nextSearchObject),
  });
};

// debounced function, to avoid changing the URL too much while typing
const debouncedUpdateLocation = debounce(updateLocation, DEBOUNCE_DELAY);

const Search = ({ history }) => {
  const [value, setValue] = useState(
    parse(history.location.search, { ignoreQueryPrefix: true }).search,
  );

  // make sure to cancel any upcoming location update if component unmounts
  useEffect(() => debouncedUpdateLocation.cancel, []);

  const handleChange = useCallback(
    ({ target: { value } }) => {
      setValue(value);

      debouncedUpdateLocation(history, value);
    },
    [history],
  );

  return (
    <span>
      <Icon>
        <FontAwesomeIcon
          icon={faSearch}
          className={value && style['search-active']}
        />
      </Icon>
      <TextField
        value={value || ''}
        onChange={handleChange}
        className={style.search}
        inputProps={inputProps}
      />
    </span>
  );
};

export default Search;
