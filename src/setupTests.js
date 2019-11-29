import React from 'react';
import { configure, mount } from 'enzyme';
import AdapterForReact16 from 'enzyme-adapter-react-16';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

// necessary set up
configure({ adapter: new AdapterForReact16() });

// we extend the expect to have it handle images
expect.extend({ toMatchImageSnapshot });

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
});

// utils
const TestHookComponent = ({ callback }) => {
  callback();
  return null;
};

const testHook = callback => mount(<TestHookComponent callback={callback} />);

export default testHook;
