import extractCounts from '.';

describe('extractCounts', () => {
  it('it should return empty counts', () => {
    expect(extractCounts()).toEqual({});
    expect(extractCounts({})).toEqual({});
    expect(extractCounts({ headers: new Headers() })).toEqual({});
    expect(extractCounts({ headers: new Headers({ length: '10' }) })).toEqual(
      {},
    );
  });

  it('it should extract counts', () => {
    expect(
      extractCounts({
        headers: new Headers([['content-range', 'frames=*/100']]),
      }),
    ).toEqual({ frames: 100 });
    expect(
      extractCounts({
        headers: new Headers([
          ['content-range', 'frames=*/100'],
          ['content-range', 'atoms=1-10/80'],
          ['content-range', 'bytes=4-8,90,182-900/1000'],
        ]),
      }),
    ).toEqual({ frames: 100, atoms: 80, bytes: 1000 });
  });
});
