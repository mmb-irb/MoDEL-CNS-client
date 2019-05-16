const getDownloadTimeEstimate = lengthInBytes => {
  const speedInBytesPerSeconds =
    (window.navigator.connection.downlink / 8) * 1e6;
  const estimateTimeInSeconds = Math.round(
    lengthInBytes / speedInBytesPerSeconds,
  );
  if (estimateTimeInSeconds <= 1) return 'instant';
  if (estimateTimeInSeconds < 60) return `${estimateTimeInSeconds} seconds`;
  const estimateTimeInMinutes = Math.round(estimateTimeInSeconds / 60);
  return `${estimateTimeInMinutes} minute${
    estimateTimeInMinutes > 1 ? 's' : ''
  }`;
};

export default (!('navigator' in window) ||
!('connection' in window.navigator) ||
!('downlink' in window.navigator.connection)
  ? () => {}
  : getDownloadTimeEstimate);
