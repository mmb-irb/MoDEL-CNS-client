import getRange from '.';

describe('getRange', () => {
  it('should return undefined when no frame is passed', () => {
    expect(getRange()).toBeUndefined();
    expect(getRange([])).toBeUndefined();
  });

  it('should return a valid range string', () => {
    expect(getRange([0])).toBe('frames=0-0');
    expect(getRange([2, 4])).toBe('frames=2-2,4-4');
  });
});
