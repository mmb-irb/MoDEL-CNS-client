const startAccessorDefault = (interval, value) =>
  Number.isFinite(value) ? (interval[0] = value) : interval[0];
const endAccessorDefault = (interval, value) =>
  Number.isFinite(value) ? (interval[1] = value) : interval[1];

const mergeIntervals = (
  intervals,
  startAccessor = startAccessorDefault,
  endAccessor = endAccessorDefault,
) => {
  const sortedIntervals = Array.from(intervals).sort(
    (a, b) => startAccessor(a) - startAccessor(b),
  );
  let output = [];
  let current;
  for (const interval of sortedIntervals) {
    if (!current) {
      // first loop
      current = interval;
    } else if (endAccessor(current) < startAccessor(interval)) {
      // current is not within interval
      output.push(current);
      current = interval;
    } else {
      // current is within, or contiguous to interval
      endAccessor(
        current,
        Math.max(endAccessor(current), endAccessor(interval)),
      );
    }
  }
  if (current) output.push(current);
  return output;
};

export default mergeIntervals;
