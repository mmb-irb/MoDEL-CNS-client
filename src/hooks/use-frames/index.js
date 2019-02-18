import useAPI from '../use-api';

import { BASE_PATH } from '../../utils/constants';

const COORDINATES_SIZE = 3; // x, y, z

const getRangeFor = (frames, atomsPerFrame) => {
  // frames = Array.from(frames);
  if (!frames || !frames.length) return;
  const bytesPerFrames =
    atomsPerFrame * COORDINATES_SIZE * Float32Array.BYTES_PER_ELEMENT;
  const range = `bytes=${frames
    .map(frame => {
      const start = frame * bytesPerFrames;
      const end = start + bytesPerFrames - 1;
      return `${start}-${end}`;
    })
    .join(',')}`;
  return range;
};

const useFrames = (accession, frames, atomsPerFrame) => {
  const range = getRangeFor(frames, atomsPerFrame);

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
