const getRange = frames => {
  if (!frames || !frames.length) return;

  const parts = [];
  let currentStart, currentEnd;
  for (const [index, frame] of frames.entries()) {
    // if this frame is NOT the one immediately after the previous one
    if (frame - 1 !== frames[index - 1]) {
      // and it's not the first time
      if (index) {
        // push the range string to the array of parts
        parts.push(`${currentStart}-${currentEnd}`);
      }
      // and set a new current start
      currentStart = frame;
    }
    // also, update the last frame that we keep track of
    currentEnd = frame;
  }
  // push the rest of the values at the end of the loop
  parts.push(`${currentStart}-${currentEnd}`);

  const output = `frames=${parts.join(',')}`;

  return output;
};

export default getRange;
