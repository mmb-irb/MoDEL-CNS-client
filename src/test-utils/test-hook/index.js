import React from 'react';
import { configure, mount } from 'enzyme';
import AdapterForReact16 from 'enzyme-adapter-react-16';

configure({ adapter: new AdapterForReact16() });

const TestHookComponent = ({ callback }) => {
  callback();
  return null;
};

const testHook = callback => mount(<TestHookComponent callback={callback} />);

export default testHook;
