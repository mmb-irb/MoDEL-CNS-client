import { useMemo } from 'react';
// Hooks
import useAPI from '../use-api'; // API access

import { BASE_PATH_PROJECTS } from '../../utils/constants';

import getRange from './get-range'; // Converts a list of frames into a single formated string
import extractCounts from './extract-counts';

const useFrames = (accession, frames, projection) => {
  const range = getRange(frames); // get a single formated string from the frames array
  // Save permanently the fetchOptions
  const fetchOptions = useMemo(
    () => ({ headers: { range }, responseType: 'arraybuffer' }),
    [range],
  );

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
      Number.isFinite(projection) ? `.pca-${projection + 1}` : ''
    }`, // Here, if you ask for the trajectory.bin instead of just trajectory, you get the whole file
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
