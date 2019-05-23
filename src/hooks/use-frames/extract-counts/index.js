const extractCounts = response => {
  if (!(response && response.headers)) return {};
  const contentRange = response.headers.get('content-range') || '';
  const types = (contentRange.match(/\w*(?==)/g) || []).filter(Boolean);
  const counts = {};
  for (const type of types) {
    counts[type] = +contentRange.match(
      new RegExp(`${type}=[^\\/]*\\/(\\d*)`),
    )[1];
  }
  return counts;
};

export default extractCounts;
