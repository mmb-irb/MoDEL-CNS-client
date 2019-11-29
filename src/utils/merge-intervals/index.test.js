import mergeIntervals from '.';

describe('mergeInterval', () => {
  it('should not mutate input', () => {
    let input = [];
    expect(input).not.toBe(mergeIntervals(input));
    //
    input = [[5, 6], [1, 2]];
    mergeIntervals(input);
    expect(input).toEqual([[5, 6], [1, 2]]);
  });

  it('should return sorted by interval start', () => {
    let input = [[5, 6], [1, 2]];
    expect(mergeIntervals(input)).toEqual([[1, 2], [5, 6]]);
    //
    input = [[1, 2], [5, 6]];
    expect(mergeIntervals(input)).toEqual([[1, 2], [5, 6]]);
    //
    input = [[1, 2]];
    expect(mergeIntervals(input)).toEqual([[1, 2]]);
    //
    input = [[5, 6], [1, 2], [7, 8]];
    expect(mergeIntervals(input)).toEqual([[1, 2], [5, 6], [7, 8]]);
  });

  it('should return merged intervals', () => {
    let input = [[5, 6], [1, 2], [3, 8]];
    expect(mergeIntervals(input)).toEqual([[1, 2], [3, 8]]);
    //
    input = [[5, 6], [1, 2], [3, 5]];
    expect(mergeIntervals(input)).toEqual([[1, 2], [3, 6]]);
    //
    input = [[5, 10], [1, 2], [3, 8]];
    expect(mergeIntervals(input)).toEqual([[1, 2], [3, 10]]);
    //
    input = [[1, 2], [2, 3]];
    expect(mergeIntervals(input)).toEqual([[1, 3]]);
  });
});
