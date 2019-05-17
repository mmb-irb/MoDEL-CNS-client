import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

import Highlight from '.';

describe('<Highlight />', () => {
  it('renders without crashing', () => {
    expect(toJSON(shallow(<Highlight />))).toBe('');
    expect(toJSON(shallow(<Highlight highlight="h" />))).toBe('');
    expect(toJSON(shallow(<Highlight>hello</Highlight>))).toBe('hello');
    expect(toJSON(shallow(<Highlight highlight="h">{''}</Highlight>))).toBe('');
    expect(toJSON(shallow(<Highlight highlight="">hello</Highlight>))).toBe(
      'hello',
    );
    expect(
      toJSON(
        shallow(
          <Highlight>
            <span>Hello</span>
          </Highlight>,
        ),
      ),
    ).toMatchSnapshot();
  });

  it('renders with highlight', () => {
    expect(
      shallow(<Highlight highlight="ll">hello</Highlight>),
    ).toMatchSnapshot();
    expect(
      shallow(<Highlight highlight="he">hello hello</Highlight>),
    ).toMatchSnapshot();
    expect(
      shallow(
        <Highlight highlight="he">
          <span>hello</span>
        </Highlight>,
      ),
    ).toMatchSnapshot();
    expect(
      shallow(<Highlight highlight="2">{1234}</Highlight>),
    ).toMatchSnapshot();
    expect(
      shallow(<Highlight highlight={2}>{1234}</Highlight>),
    ).toMatchSnapshot();
  });
});
