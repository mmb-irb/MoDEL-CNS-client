import React from 'react';
import { render, cleanup } from '@testing-library/react';

import { HashRouter as Router } from 'react-router-dom';

import Menu from '.';

describe('<Menu />', () => {
  let wrapper;

  afterEach(() => wrapper && wrapper.unmount());

  afterAll(cleanup);

  it('should render without crashing', () => {
    expect(
      () =>
        (wrapper = render(
          <Router>
            <Menu />
          </Router>,
        )),
    ).not.toThrow();
  });
});
