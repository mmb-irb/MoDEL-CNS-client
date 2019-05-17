import { act } from 'react-dom/test-utils';

import testHook from '../../setupTests';

import useToggleState from '.';

let toggle;

beforeEach(() => testHook(() => (toggle = useToggleState(true))));

describe('useToggleState', () => {
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
});
