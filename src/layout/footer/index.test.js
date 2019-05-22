import React from 'react';
import { shallow } from 'enzyme';

import Footer from '.';

describe('<Footer />', () => {
  it('should render', () => {
    expect(shallow(<Footer />)).toMatchSnapshot();
  });
});
