import React from 'react';
import ReactDOM from 'react-dom';

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

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
};

main();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register({});
