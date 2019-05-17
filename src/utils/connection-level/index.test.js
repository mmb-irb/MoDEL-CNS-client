import connectionLevel, { MEDIUM, LOW, HIGH } from '.';

describe('connectionLevel', () => {
  it('should give a default value when not mocked/not available', () => {
    navigator.connection = undefined;
    expect(connectionLevel()).toBe(MEDIUM);
  });

  it('should give a low value when "saveData" is on', () => {
    navigator.connection = { saveData: true };
    expect(connectionLevel()).toBe(LOW);
  });

  it('should give a value corresponding to effective type', () => {
    navigator.connection = {};
    expect(connectionLevel()).toBe(MEDIUM);
    navigator.connection = { effectiveType: 'slow-2g' };
    expect(connectionLevel()).toBe(LOW);
    navigator.connection = { effectiveType: '2g' };
    expect(connectionLevel()).toBe(LOW);
    navigator.connection = { effectiveType: '3g' };
    expect(connectionLevel()).toBe(MEDIUM);
    navigator.connection = { effectiveType: '4g' };
    expect(connectionLevel()).toBe(HIGH);
    navigator.connection = { effectiveType: 'xg' };
    expect(connectionLevel()).toBe(HIGH);
  });
});
