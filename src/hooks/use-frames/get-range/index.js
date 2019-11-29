// This functions converts an array of frames (int) into single formated string
// The string contains all frames in ranges and a prefix (e.g. "frames=1-2,3-3,4-4")
const getRange = frames => {
  // If there are no frames return here
  if (!frames || !frames.length) return;

  const parts = [];
  let currentStart, currentEnd;
  // JavaScript method Array.entries() return an array with all keys (indexes) and their values in a [key, value] format
  for (const [index, frame] of frames.entries()) {
    // if this frame is NOT the one immediately after the previous one
    if (frame - 1 !== frames[index - 1]) {
      // and it's not the first time (index != 0)
      if (index) {
        // push the range string to the array of parts
        parts.push(`${currentStart}-${currentEnd}`);
      }
      // set a new current start
      currentStart = frame;
    }
    // also, update the last frame that we keep track of
    currentEnd = frame;
  }
  // push the rest of the values at the end of the loop
  parts.push(`${currentStart}-${currentEnd}`);

  // Finall joins all frames in a single formated string
  const output = `frames=${parts.join(',')}`;

  return output;
};

export default getRange;
