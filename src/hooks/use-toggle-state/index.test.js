import { act } from 'react-dom/test-utils';

import testHook from '../../test-utils/test-hook';

import useToggleState from '.';

let toggle;

beforeEach(() => testHook(() => (toggle = useToggleState(true))));

describe('useToggleState', () => {
  test('should have a default value', () => {
    expect(toggle[0]).toBe(true);
  });

  test('should have a toggle function', () => {
    expect(toggle[1]).toBeInstanceOf(Function);
  });

  test('should toggle value', () => {
    act(() => toggle[1]());
    expect(toggle[0]).toBe(false);
    act(() => toggle[1]());
    expect(toggle[0]).toBe(true);
  });
});
