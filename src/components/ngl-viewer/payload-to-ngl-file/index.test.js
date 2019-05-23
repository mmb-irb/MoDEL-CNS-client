import payloadToNGLFile from '.';

const pdbFile = {
  atomCount: 2,
  getAtomProxy: i => ({ element: i % 2 ? 'C' : 'H' }),
};

const twoFrames = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const fileTemplate = { boxes: [], type: 'Frames' };

describe('payloadToNGLFile', () => {
  it('should return undefined if no data', () => {
    expect(payloadToNGLFile(pdbFile)).toBeUndefined();
  });

  it('should work for basic trajectory', () => {
    const file = payloadToNGLFile(pdbFile, twoFrames, 2, 2, false, false);
    expect(file).toEqual({
      ...fileTemplate,
      coordinates: [
        new Float32Array([0, 1, 2, 3, 4, 5]),
        new Float32Array([6, 7, 8, 9, 10, 11]),
      ],
    });
  });

  it('should work for one-frame trajectory', () => {
    const file = payloadToNGLFile(pdbFile, twoFrames, 2, 2, false, true);
    expect(file).toEqual({
      ...fileTemplate,
      coordinates: [new Float32Array([0, 1, 2, 3, 4, 5])],
    });
  });

  it('should work for projection trajectory', () => {
    const nAtoms = 1;
    const nFrames = 21;
    const file = payloadToNGLFile(
      { ...pdbFile, atomCount: 3 },
      // 21 frames * 1 atoms * 3 coordinates (0 -> 125)
      Array.from({ length: nFrames * nAtoms * 3 }, (_, i) => i),
      nAtoms,
      nFrames,
      true,
      false,
    );
    expect(file).toEqual({
      ...fileTemplate,
      // prettier-ignore
      coordinates: [
        new Float32Array([0, 0, 0,  0,   1,   2, 0, 0, 0]),
        new Float32Array([0, 0, 0,  3,   4,   5, 0, 0, 0]),
        new Float32Array([0, 0, 0,  6,   7,   8, 0, 0, 0]),
        new Float32Array([0, 0, 0,  9,  10,  11, 0, 0, 0]),
        new Float32Array([0, 0, 0, 12,  13,  14, 0, 0, 0]),
        new Float32Array([0, 0, 0, 15,  16,  17, 0, 0, 0]),
        new Float32Array([0, 0, 0, 18,  19,  20, 0, 0, 0]),
        new Float32Array([0, 0, 0, 21,  22,  23, 0, 0, 0]),
        new Float32Array([0, 0, 0, 24,  25,  26, 0, 0, 0]),
        new Float32Array([0, 0, 0, 27,  28,  29, 0, 0, 0]),
        new Float32Array([0, 0, 0, 30,  31,  32, 0, 0, 0]),
        new Float32Array([0, 0, 0, 33,  34,  35, 0, 0, 0]),
        new Float32Array([0, 0, 0, 36,  37,  38, 0, 0, 0]),
        new Float32Array([0, 0, 0, 39,  40,  41, 0, 0, 0]),
        new Float32Array([0, 0, 0, 42,  43,  44, 0, 0, 0]),
        new Float32Array([0, 0, 0, 45,  46,  47, 0, 0, 0]),
        new Float32Array([0, 0, 0, 48,  49,  50, 0, 0, 0]),
        new Float32Array([0, 0, 0, 51,  52,  53, 0, 0, 0]),
        new Float32Array([0, 0, 0, 54,  55,  56, 0, 0, 0]),
        new Float32Array([0, 0, 0, 57,  58,  59, 0, 0, 0]),
      ]
    });
  });
});
