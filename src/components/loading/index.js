import React, { useLayoutEffect } from 'react';
import cn from 'classnames';
import { sleep, frame } from 'timing-functions';

import { CircularProgress } from '@material-ui/core';

import useToggleState from '../../hooks/use-toggle-state';

import style from './style.module.css';

const WAIT_DELAY = 750; // 750ms

/**
 * This component is used to hide the loading indicator for a bit (just in case
 * the next content is quick enough, because we don't want a flash with the
 * indicator), then slowly display it.
 * In the best of cases this component will *never* even have to be displayed 🤞
 */
const Loading = () => {
  const [flag, toggleFlag] = useToggleState(false);

  useLayoutEffect(() => {
    let mounted = true;
    sleep(WAIT_DELAY) // wait for a bit
      // this might be useful if the page is not even visible
      .then(() => frame())
      // After all the waiting check the indicator still mounted and visible
      .then(() => mounted && toggleFlag());
    return () => (mounted = false);
  }, [toggleFlag]);

  return (
    <div
      title="loading..."
      className={cn(style.loading, { [style.show]: flag })}
    >
      {flag && (
        <CircularProgress variant="indeterminate" color="secondary" size={40} />
      )}
    </div>
  );
};

export default Loading;
