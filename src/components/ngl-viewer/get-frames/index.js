const getFrames = (
  isProjection,
  metadata,
  noTrajectory,
  nFrames,
  requestedFrame,
) => {
  if (isProjection) return Array.from({ length: 20 }, (_, i) => i);
  // multiple frames loaded, as a trajectory
  if (metadata && !noTrajectory) {
    const frameStep = Math.floor(metadata.frameCount / nFrames);
    return Array.from({ length: nFrames }, (_, i) => i * frameStep);
  }
  // only one specific frame loaded
  if (metadata && noTrajectory && Number.isFinite(requestedFrame)) {
    return [requestedFrame];
  }
  return [];
};

export default getFrames;
