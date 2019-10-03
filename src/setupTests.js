import React from 'react';
import { configure, mount } from 'enzyme';
import AdapterForReact16 from 'enzyme-adapter-react-16';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

import { Readable } from 'stream';

// necessary set up
configure({ adapter: new AdapterForReact16() });

// we extend the extension, to also have it understand ReadableStreams
expect.extend({
  toMatchImageSnapshot(imageOrStream, ...args) {
    const boundMatcher = toMatchImageSnapshot.bind(this);
    if (!(imageOrStream instanceof Readable)) {
      return boundMatcher(imageOrStream, ...args);
    }
    // we have a stream, use it first to pass the complete buffer to the matcher
    const parts = [];
    imageOrStream.on('data', chunk => parts.push(chunk));
    return new Promise((res, rej) => {
      imageOrStream.on('error', rej);
      imageOrStream.on('end', () => {
        res(boundMatcher(Buffer.concat(parts), ...args));
      });
    });
  },
});

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
