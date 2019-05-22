import React from 'react';
import { shallow } from 'enzyme';

import NGLViewerInDND from '.';

describe('<NGLViewerInDND />', () => {
  it('should render', () => {
    expect(
      shallow(<NGLViewerInDND accession="MCNS00001" analysis="fluctuation" />),
    ).toMatchSnapshot();
  });
});
