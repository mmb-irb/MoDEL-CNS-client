import processIPScanResults from '.';

describe('processIPScanResults', () => {
  it('should return empty array when no match passed', () => {
    expect(processIPScanResults()).toEqual([]);
    expect(processIPScanResults(null)).toEqual([]);
    expect(processIPScanResults([])).toEqual([]);
  });

  it('should return a transformed array of matches', () => {
    expect(processIPScanResults(require('./example1.json'))).toMatchSnapshot();
    expect(processIPScanResults(require('./example2.json'))).toMatchSnapshot();
  });
});
