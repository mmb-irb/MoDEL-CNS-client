import processStats from '.';

describe('processStats', () => {
  let e;
  let t;
  it('should return undefined when no data is available', () => {
    [e, t] = processStats();
    expect(e).toBeUndefined();
    expect(t).toBeUndefined();

    [e, t] = processStats({ y: {} });
    expect(e).toBeUndefined();
    expect(t).toBeUndefined();
  });

  it('should return correct values', () => {
    [e, t] = processStats({ y: { a: { eigenvalue: 2 } } });
    expect(e).toBe(0);
    expect(t).toBe(2);

    [e, t] = processStats({ y: { a: { eigenvalue: 2 } } }, [0]);
    expect(e).toBe(1);
    expect(t).toBe(2);

    [e, t] = processStats({
      y: { a: { eigenvalue: 3 }, b: { eigenvalue: 1 } },
    });
    expect(e).toBe(0);
    expect(t).toBe(4);

    [e, t] = processStats(
      { y: { a: { eigenvalue: 3 }, b: { eigenvalue: 1 } } },
      [0],
    );
    expect(e).toBe(0.75);
    expect(t).toBe(4);

    [e, t] = processStats(
      { y: { a: { eigenvalue: 3 }, b: { eigenvalue: 1 } } },
      [0, 1],
    );
    expect(e).toBe(1);
    expect(t).toBe(4);
  });
});
