import { useMemo } from 'react';

import useAPI from '../use-api';
import useProgress from '../use-progress';

import { BASE_PATH_PROJECTS } from '../../utils/constants';

import getRange from './get-range';
import extractCounts from './extract-counts';

const useFrames = (accession, frames, projection) => {
  const range = getRange(frames);
  const fetchOptions = useMemo(() => ({ headers: { range } }), [range]);

  const { loading, payload, error, previousPayload, response } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/files/trajectory${
      Number.isFinite(projection) ? `.pca-${projection + 1}` : ''
    }.bin`,
    { bodyParser: 'arrayBuffer', fetchOptions },
  );

  const progress = useProgress(response);

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
