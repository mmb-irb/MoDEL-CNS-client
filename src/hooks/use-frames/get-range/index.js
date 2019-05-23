const getRange = frames => {
  if (!frames || !frames.length) return;
  return `frames=${frames.map(frame => `${frame}-${frame}`).join(',')}`;
};

export default getRange;
