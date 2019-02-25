import useAPI from '../use-api';

import { BASE_PATH } from '../../utils/constants';

const getRangeFor = frames => {
  if (!frames || !frames.length) return;
  return `frames=${frames.map(frame => `${frame}-${frame}`).join(',')}`;
};

const useFrames = (accession, frames, atomsPerFrame) => {
  const range = getRangeFor(frames);

  const { loading, payload, error, previousPayload, progress } = useAPI(
    frames.length &&
      atomsPerFrame &&
      `${BASE_PATH}${accession}/files/trajectory.bin`,
    {
      bodyParser: 'arrayBuffer',
      range,
      withProgress: true,
    },
  );

  return {
    loading,
    frameData: payload,
    error,
    previousFrameData: previousPayload,
    progress,
  };
};

export default useFrames;
