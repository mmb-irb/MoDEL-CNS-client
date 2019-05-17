import numberFormatter from '.';

describe('numberFormatter', () => {
  it('should give a formatted string', () => {
    expect(numberFormatter(1000)).toBe('1,000');
    expect(numberFormatter('1234')).toBe('1,234');
  });

  it('should give a string when not mocked/not available', () => {
    const { Intl } = window;
    window.Intl = null;
    expect(numberFormatter(1000)).toBe('1000');
    expect(numberFormatter('1234')).toBe('1234');
    window.Intl = Intl;
  });
});
