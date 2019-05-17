import getDownloadTimeEstimate from '.';

describe('getDownloadTimeEstimate', () => {
  it('should give an undefined value when not mocked/not available', () => {
    expect(getDownloadTimeEstimate()).toBeNull();
  });

  it('should give a time estimate', () => {
    navigator.connection = { downlink: 1 };
    expect(getDownloadTimeEstimate(10)).toBe('instant');
    navigator.connection = { downlink: 1 };
    expect(getDownloadTimeEstimate(1e6)).toBe('8 seconds');
    navigator.connection = { downlink: 1 };
    expect(getDownloadTimeEstimate(1e7)).toBe('1 minute');
    navigator.connection = { downlink: 1 };
    expect(getDownloadTimeEstimate(1e8)).toBe('13 minutes');
  });
});
