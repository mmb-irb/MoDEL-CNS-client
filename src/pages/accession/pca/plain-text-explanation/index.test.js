import plainTextExplanation from '.';

describe('plainTextExplanation', () => {
  it('should return text when no projection selected', () => {
    const text = plainTextExplanation([], 0);
    expect(typeof text).toBe('string');
    expect(text).toMatchSnapshot();
  });

  it('should return text when 1 projection is selected', () => {
    const text = plainTextExplanation([0], 0.25);
    expect(typeof text).toBe('string');
    expect(text).toMatchSnapshot();
  });

  it('should return text when 2 projections are selected', () => {
    const text = plainTextExplanation([0, 2], 0.30000005);
    expect(typeof text).toBe('string');
    expect(text).toMatchSnapshot();
  });

  it('should return text when 3 projections are selected', () => {
    const text = plainTextExplanation([1, 4, 8], 0.5);
    expect(typeof text).toBe('string');
    expect(text).toMatchSnapshot();
  });
});
