import { act } from 'react-dom/test-utils';

import testHook from '../../setupTests';

import useToggleState from '.';

let toggle;

describe('useToggleState', () => {
  beforeEach(() => testHook(() => (toggle = useToggleState(true))));

  it('should have a default value', () => {
    expect(toggle[0]).toBe(true);
  });

  it('should have a toggle function', () => {
    expect(toggle[1]).toBeInstanceOf(Function);
  });

  it('should toggle value', () => {
    act(() => toggle[1]());
    expect(toggle[0]).toBe(false);
    act(() => toggle[1]());
    expect(toggle[0]).toBe(true);
  });

  it('should handle function callback', () => {
    act(() => toggle[1](value => !value));
    expect(toggle[0]).toBe(false);
  });

  it('should handle just setting/casting value', () => {
    act(() => toggle[1]('truthy'));
    expect(toggle[0]).toBe(true);
    act(() => toggle[1](''));
    expect(toggle[0]).toBe(false);
    act(() => toggle[1](1));
    expect(toggle[0]).toBe(true);
    act(() => toggle[1](0));
    expect(toggle[0]).toBe(false);
    act(() => toggle[1](true));
    expect(toggle[0]).toBe(true);
  });
});
