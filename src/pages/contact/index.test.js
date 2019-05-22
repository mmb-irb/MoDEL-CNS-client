import React from 'react';
import { shallow } from 'enzyme';

import Contact from '.';

describe('<Contact />', () => {
  it('should render', () => {
    expect(shallow(<Contact />)).toMatchSnapshot();
  });
});
