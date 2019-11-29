import getFrames from '.';
// Todo: Update this test
describe.skip('getFrames', () => {
  it('should return frames for projection', () => {
    expect(getFrames(true)).toEqual(
      // prettier-ignore
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    );
  });

  it('should return frames for projection (subset of all)', () => {
    expect(getFrames(false, { frameCount: 10 }, false, 5)).toEqual(
      // prettier-ignore
      [0, 2, 4, 6, 8],
    );
    expect(getFrames(false, { frameCount: 15 }, false, 5)).toEqual(
      // prettier-ignore
      [0, 3, 6, 9, 12],
    );
  });

  it('should return one frame', () => {
    expect(getFrames(false, {}, true, null, 7)).toEqual([7]);
    expect(getFrames(false, {}, true, null, 0)).toEqual([0]);
  });

  it('should default to empty array', () => expect(getFrames()).toEqual([]));
});
