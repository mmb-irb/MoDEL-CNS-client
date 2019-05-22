import React from 'react';
import { shallow } from 'enzyme';

import Main from '.';

describe('<Main />', () => {
  it('should render', () => {
    expect(
      shallow(
        <Main>
          <section />
        </Main>,
      ),
    ).toMatchSnapshot();
  });
});
