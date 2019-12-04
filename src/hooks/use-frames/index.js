import { useMemo } from 'react';
// Hooks
import useAPI from '../use-api'; // API access

import { BASE_PATH_PROJECTS } from '../../utils/constants';

import extractCounts from './extract-counts';

const useFrames = (accession, frames, projection) => {
  // Save permanently the fetchOptions
  const fetchOptions = useMemo(() => ({ responseType: 'arraybuffer' }), []);

  const isProjection = Number.isFinite(projection);

  // Load data from the API
  const {
    loading,
    payload,
    error,
    previousPayload,
    response,
    progress,
  } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/files/trajectory${
      isProjection ? `.pca-${projection + 1}.bin` : ''
      // Frames are included only when there is no projection (i.e. it is not a pca analysis)
    }${Boolean(frames && !isProjection) ? `?frames=${frames}` : ''}`,
    // Here, if you ask for the trajectory.bin instead of just trajectory, you get the whole file
    // This is because the only route of the API accepting frames selection is the "trajectory" endpoint
    // Other paths such as "trajectory.bin" will be processed as "/:files"
    fetchOptions,
  );

  // Save the result of extractCounts as a Memo since this function is a heavy work
  const counts = useMemo(() => extractCounts(response), [response]);

  return {
    loading,
    frameData: payload,
    error,
    previousFrameData: previousPayload,
    progress,
    counts,
  };
};

export default useFrames;
