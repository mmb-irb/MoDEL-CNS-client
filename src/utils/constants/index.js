export const BASE_PATH = process.env.REACT_APP_REST_ROOT;

export const BASE_PATH_PROJECTS = BASE_PATH + 'current/projects/';

export const NICE_NAMES = new Map([
  ['rmsd', 'RMSd'],
  ['rgyr', 'Rgyr'],
  ['rgyrx', 'RgyrX'],
  ['rgyry', 'RgyrY'],
  ['rgyrz', 'RgyrZ'],
  ['rmsf', 'Fluctuation'],
  ['fluctuation', 'Fluctuation'],
  ['pca', 'PCA'],
]);

export const COLORS = new Map([
  ['rmsd', '#67b7dc'],
  ['rgyr', '#67b7dc'],
  ['rgyrx', '#fdd400'],
  ['rgyry', '#84b761'],
  ['rgyrz', '#cc4748'],
  ['rmsf', '#67b7dc'],
  ['fluct', '#67b7dc'],
  ['time', 'gray'],
]);
