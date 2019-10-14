import React from 'react';
import ReactDOM from 'react-dom';
import { sleep } from 'timing-functions';

import App from './App';

import * as serviceWorker from './serviceWorker';

import './index.css';
import 'typeface-roboto';

const loadPolyfills = async () => {
  if (typeof window.IntersectionObserver === 'undefined') {
    await import(
      /* webpackChunkName: "intersection-observer" */ 'intersection-observer'
    );
  }
};

const main = async () => {
  await loadPolyfills();
  ReactDOM.render(<App />, document.getElementById('root'));
  await sleep(1000);
  window.dispatchEvent(
    new CustomEvent('sw update', {
      detail: 'Updated content is available. Please reload the page.',
    }),
  );
};

main();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register({});
