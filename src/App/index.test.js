import React from 'react';
import { render, cleanup } from '@testing-library/react';

import App from '.';

describe('<App />', () => {
  let wrapper;

  afterEach(() => wrapper && wrapper.unmount());

  afterAll(cleanup);

  it('should render without crashing', async () => {
    expect(() => (wrapper = render(<App />))).not.toThrow();
  });
});
