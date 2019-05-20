import React from 'react';
import { configure, mount } from 'enzyme';
import AdapterForReact16 from 'enzyme-adapter-react-16';

// necessary set up
configure({ adapter: new AdapterForReact16() });

// utils
const TestHookComponent = ({ callback }) => {
  callback();
  return null;
};

const testHook = callback => mount(<TestHookComponent callback={callback} />);

export default testHook;
