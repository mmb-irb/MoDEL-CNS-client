import { useMemo } from 'react';

import useAPI from '../use-api';
import useProgress from '../use-progress';

import { BASE_PATH_PROJECTS } from '../../utils/constants';

const getRangeFor = frames => {
  if (!frames || !frames.length) return;
  return `frames=${frames.map(frame => `${frame}-${frame}`).join(',')}`;
};

const useFrames = (accession, frames, projection) => {
  const range = getRangeFor(frames);
  const fetchOptions = useMemo(() => ({ headers: { range } }), [range]);

  const { loading, payload, error, previousPayload, response } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/files/trajectory${
      Number.isFinite(projection) ? `.pca-${projection + 1}` : ''
    }.bin`,
    { bodyParser: 'arrayBuffer', fetchOptions },
  );

  const progress = useProgress(response);

  const counts = useMemo(() => {
    if (!response) return {};
    const contentRange = response.headers.get('content-range') || '';
    const types = (contentRange.match(/\w*(?==)/g) || []).filter(Boolean);
    const counts = {};
    for (const type of types) {
      counts[type] = +contentRange.match(
        new RegExp(`${type}=[^\\/]*\\/(\\d*)`),
      )[1];
    }
    return counts;
  }, [response]);

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
