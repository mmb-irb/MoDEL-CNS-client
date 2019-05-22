import { round } from 'lodash-es';

const plainTextExplanation = (projections, explanation) => {
  if (!projections.length) {
    return `No projection selected, please select one or multiple projections to
    visualise its or their related data. Only the darker blue bars correspond to
    projections for which data has been calculated.`;
  }
  let projectionText;
  if (projections.length === 1) {
    projectionText = projections[0] + 1;
  } else if (projections.length === 2) {
    projectionText = `${projections[0] + 1} and ${projections[1] + 1}`;
  } else {
    projectionText = projections.reduce(
      (acc, projection, i, { length }) =>
        `${acc}${acc ? ',' : ''}${i === length - 1 ? ' and' : ''} ${projection +
          1}`,
      '',
    );
  }
  return `Selected principal component${
    projections.length > 1 ? 's' : ''
  } ${projectionText}, accounting for ${round(
    explanation * 100,
    1,
  )}% of explained variance`;
};

export default plainTextExplanation;
