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
    const frameStep = Math.floor(metadata.frameCount / nFrames);
    return `${1}:${metadata.frameCount}:${frameStep}`;
  }
  // only one specific frame loaded, as a projection
  if (metadata && noTrajectory && Number.isFinite(requestedFrame)) {
    return (requestedFrame + 1).toString();
  }
};

export default getFrames;
