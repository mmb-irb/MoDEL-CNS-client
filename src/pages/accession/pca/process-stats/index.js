const processStats = (data, projections = []) => {
  if (!data) return [];

  const values = Object.values(data.y);

  if (!values.length) return [];

  const totalEigenvalue = values.reduce(
    (acc, component) => acc + component.eigenvalue,
    0,
  );

  const explanation =
    projections.reduce(
      (acc, projection) => acc + values[projection].eigenvalue,
      0,
    ) / totalEigenvalue;

  return [explanation, totalEigenvalue];
};

export default processStats;
