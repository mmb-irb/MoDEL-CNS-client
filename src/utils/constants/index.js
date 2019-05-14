export const BASE_PATH = window.location.origin.includes('localhost')
  ? 'http://localhost:8000/rest/'
  : 'https://mmb.irbbarcelona.org/webdev2/MoDEL-CNS/api/rest/';

// export const BASE_PATH =
// 'https://mmb.irbbarcelona.org/webdev2/MoDEL-CNS/api/rest/';

export const BASE_PATH_PROJECTS = BASE_PATH + 'current/projects/';

export const NICE_NAMES = new Map([
  ['rmsd', 'RMSd'],
  ['rgyr', 'Rgyr'],
  ['rgyrx', 'RgyrX'],
  ['rgyry', 'RgyrY'],
  ['rgyrz', 'RgyrZ'],
  ['rmsf', 'Fluctuation'],
]);

export const COLORS = new Map([
  ['rmsd', '#67b7dc'],
  ['rgyr', '#67b7dc'],
  ['rgyrx', '#fdd400'],
  ['rgyry', '#84b761'],
  ['rgyrz', '#cc4748'],
  ['rmsf', '#67b7dc'],
  ['time', 'gray'],
]);
