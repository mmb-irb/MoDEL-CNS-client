import React from 'react';
import { shallow } from 'enzyme';

import NGLViewerWithControls from '.';

describe('<NGLViewerWithControls />', () => {
  it('should render', () => {
    expect(shallow(<NGLViewerWithControls />)).toMatchSnapshot();
  });
});
