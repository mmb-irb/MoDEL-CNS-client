import React from 'react';
import { shallow } from 'enzyme';

import Body from '.';

describe('<Body />', () => {
  it('should render', () => {
    expect(
      shallow(
        <Body>
          <section />
        </Body>,
      ),
    ).toMatchSnapshot();
  });
});
