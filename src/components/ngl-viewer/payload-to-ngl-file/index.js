const COORDINATES_NUMBER = 3;

const payloadToNGLFile = (
  pdbFile,
  dcdPayload,
  atoms,
  nFrames,
  isProjection,
  isOneFrame,
) => {
  if (!(pdbFile && dcdPayload)) return;

  const view = new Float32Array(dcdPayload);
  const file = {
    boxes: [],
    type: 'Frames',
    coordinates: [],
  };
  let length = nFrames;
  if (isProjection) {
    length = 20;
  } else if (isOneFrame) {
    length = 1;
  }
  for (let i = 0; i < length; i++) {
    const coordinates = new Float32Array(
      pdbFile.atomCount * COORDINATES_NUMBER,
    );
    let k = 0;
    if (isProjection) {
      // if it is a PCA projection
      for (let j = 0; j < pdbFile.atomCount; j++) {
        if (k >= atoms) break;
        if (pdbFile.getAtomProxy(j).element !== 'H') {
          // getting value from trajectory
          coordinates[j * COORDINATES_NUMBER] =
            view[i * atoms * COORDINATES_NUMBER + k * COORDINATES_NUMBER];
          coordinates[j * COORDINATES_NUMBER + 1] =
            view[i * atoms * COORDINATES_NUMBER + k * COORDINATES_NUMBER + 1];
          coordinates[j * COORDINATES_NUMBER + 2] =
            view[i * atoms * COORDINATES_NUMBER + k * COORDINATES_NUMBER + 2];
          k++;
        }
      }
    } else {
      // if it is not a PCA projection
      coordinates.set(
        view.subarray(
          i * atoms * COORDINATES_NUMBER,
          (i + 1) * atoms * COORDINATES_NUMBER,
        ),
      );
    }
    file.coordinates.push(coordinates);
  }

  return file;
};

export default payloadToNGLFile;
