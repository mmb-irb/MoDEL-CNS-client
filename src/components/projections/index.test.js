import React from 'react';
import { render, cleanup } from 'react-testing-library';

import Projections from '.';

const data = [
  { eigenvalue: 50, data: [1, 2] },
  { eigenvalue: 50, data: [2, 3] },
];

afterAll(cleanup);

describe('<Projections />', () => {
  let wrapper;

  afterAll(() => wrapper.unmount());

  it('should render', async () => {
    wrapper = render(<Projections data={data} projections={[0, 1]} />);
    expect(wrapper.container).toBeInstanceOf(HTMLElement);
  });
});
