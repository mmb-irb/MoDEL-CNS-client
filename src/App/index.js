import React from 'react';
import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';
import { sleep } from 'timing-functions';

import Root from '../Root';

// Hijack a bit the block/userConfirm logic in the history library
const history = createHashHistory({
  // we don't really ask for the user confirmation...
  async getUserConfirmation(nextPathname, callback) {
    // if new path
    if (nextPathname !== history.location.pathname) {
      // get all current sections
      const sections = Array.from(
        document.querySelectorAll('main section'),
      ).reverse();
      sections.forEach((section, index) => {
        if (!section.animate) return;
        // and trigger animation out
        section.animate(
          {
            opacity: [1, 0],
            transform: ['translateY(0)', 'translateY(50px)'],
          },
          {
            fill: 'both',
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            duration: 500,
            delay: Math.min(250, index * 100),
          },
        );
      });
      // if there were sections, wait a bit to let go away
      if (sections.length) await sleep(500);
    }
    callback(true);
  },
});

// Will call getUserConfirmation everytime location changes
history.block(nextLocation => nextLocation.pathname);

// end of hacky part with the history library

const App = () => (
  <Router history={history}>
    <Root />
  </Router>
);

export default App;
