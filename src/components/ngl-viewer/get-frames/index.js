// This function expects to receive a specific frame or the number of frames to load
// This function returns a string which specifies the frames to be loaded
// This string is standarized in a API friendly format
const getFrames = (
  isProjection,
  metadata,
  noTrajectory,
  nFrames,
  requestedFrame,
) => {
  if (isProjection)
    return Array.from({ length: 20 }, (_, i) => i + 1).join(',');
  // multiple frames loaded, as a trajectory
  if (metadata && !noTrajectory) {
    if (!metadata.frameCount)
      return console.error('Metadata has no frameCount');
    const frameStep = Math.floor(metadata.frameCount / nFrames);
    return `${1}:${metadata.frameCount}:${frameStep}`;
  }
  // only one specific frame loaded, as a projection
  if (metadata && noTrajectory && Number.isFinite(requestedFrame)) {
    return (requestedFrame + 1).toString();
  }
};

export default getFrames;
