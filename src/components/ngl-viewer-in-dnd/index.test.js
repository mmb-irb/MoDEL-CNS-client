import React from 'react';
import { shallow } from 'enzyme';

import NGLViewerSpawner from '.';
// Esto ha cambiado mucho. hay que probarlo
//describe('<NGLViewerInDND />', () => {
describe('NGLViewerSpawner', () => {
  it('should render', () => {
    expect(
      //shallow(<NGLViewerInDND accession="MCNS00001" analysis="fluctuation" />),
      NGLViewerSpawner({ accession: 'MCNS00001', analysis: 'fluctuation' }),
    ).toMatchSnapshot();
  });
});
