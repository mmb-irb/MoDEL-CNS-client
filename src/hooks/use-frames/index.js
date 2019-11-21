import { useMemo } from 'react';

import useAPI from '../use-api';

import { BASE_PATH_PROJECTS } from '../../utils/constants';

import getRange from './get-range';
import extractCounts from './extract-counts';

const useFrames = (accession, frames, projection) => {
  const range = getRange(frames);
  const fetchOptions = useMemo(
    () => ({ headers: { range }, responseType: 'arraybuffer' }),
    [range],
  );

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
