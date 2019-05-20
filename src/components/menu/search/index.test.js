import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import { createMemoryHistory } from 'history';
import { sleep } from 'timing-functions';

import Search, { updateLocation } from '.';

describe('Search', () => {
  let wrapper;
  let history;
  let unlisten;

  beforeEach(() => {
    history = createMemoryHistory();
    wrapper = render(<Search history={history} />);
  });

  afterEach(() => {
    if (unlisten) {
      unlisten();
      unlisten = null;
    }
    if (wrapper) wrapper.unmount();
  });

  afterAll(cleanup);

  it('should render', () => {
    expect(wrapper.container).toBeInstanceOf(HTMLElement);
  });

  it('should accept input', cb => {
    const input = wrapper.container.querySelector('input');
    const newValue = 'abcd';

    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: newValue } });

    // DOM should be updated right away
    expect(input.value).toBe(newValue);
    // But history shouldn't
    expect(history.location.search).not.toEqual(
      expect.stringContaining(newValue),
    );

    unlisten = history.listen(() => {
      // It should update eventually
      expect(history.location.search).toEqual(
        expect.stringContaining(newValue),
      );
      cb();
    });
  });

  it('should accept multiple inputs, but only update history once with the final value', cb => {
    const input = wrapper.container.querySelector('input');
    const newValue = 'abcd';

    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: newValue.substr(0, 2) } });

    // DOM should be updated right away
    expect(input.value).toBe(newValue.substr(0, 2));
    // But history shouldn't
    expect(history.location.search).not.toEqual(
      expect.stringContaining(newValue.substr(0, 2)),
    );

    sleep(100).then(() => {
      // complete typing with a bit of delay
      fireEvent.change(input, { target: { value: newValue } });

      // DOM should be updated right away
      expect(input.value).toBe(newValue);
      // But history shouldn't
      expect(history.location.search).not.toEqual(
        expect.stringContaining(newValue),
      );
    });

    unlisten = history.listen(() => {
      // It should update eventually, directly to final value
      expect(history.location.search).toEqual(
        expect.stringContaining(newValue),
      );
      cb();
    });
  });

  it('should render with value set from history', () => {
    history.location.search = '?search=xyz';
    if (wrapper.unmount) wrapper.unmount();
    wrapper = render(<Search history={history} />);
    expect(wrapper.container.querySelector('input').value).toBe('xyz');
  });
});

describe('updateLocation', () => {
  let history;

  beforeEach(() => {
    history = createMemoryHistory();
  });

  it('should push into history if previous undefined, and next defined', () => {
    updateLocation(history, 'text');
    expect(history.location.search).toBe('?search=text');
    expect(history.length).toBe(2);
  });

  it('should push into history if previous defined, and next undefined', () => {
    history.location.search = '?search=text';
    updateLocation(history, '');
    expect(history.location.search).toBe('');
    expect(history.length).toBe(2);
  });

  it('should replace history if previous defined, and next defined', () => {
    history.location.search = '?search=t';
    updateLocation(history, 'text');
    expect(history.location.search).toBe('?search=text');
    expect(history.length).toBe(1);
  });

  it('should replace history if previous undefined, and next undefined', () => {
    updateLocation(history, '');
    expect(history.location.search).toBe('');
    expect(history.length).toBe(1);
  });

  it("shouldn't do anything if value is same before and after", () => {
    history.location.search = '?search=text';
    const { key } = history.location;
    updateLocation(history, 'text');
    expect(history.location.search).toBe('?search=text');
    expect(history.length).toBe(1);
    expect(history.location.key).toBe(key);
  });
});
