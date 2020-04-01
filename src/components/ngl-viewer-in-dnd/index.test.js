import React from 'react';
import { shallow } from 'enzyme';

import NGLViewerSpawner from '.';
// Esto ha cambiado mucho. hay que probarlo
describe('<NGLViewerSpawner />', () => {
  it('should render', () => {
    expect(
      shallow(
        <NGLViewerSpawner
          accession="MCNS00001"
          analysis="fluctuation"
          requestedFrame="1"
        />,
      ),
    ).toMatchSnapshot();
  });
});
