export const BASE_PATH = window.location.origin.includes('localhost')
  ? 'http://localhost:8000/rest/current/projects/'
  : 'https://mmb.irbbarcelona.org/webdev2/MoDEL-CNS/api/rest/current/projects/';

export const NICE_NAMES = new Map([
  ['rmsd', 'RMSd'],
  ['rgyr', 'Rgyr'],
  ['rgyrx', 'RgyrX'],
  ['rgyry', 'RgyrY'],
  ['rgyrz', 'RgyrZ'],
]);

export const COLORS = new Map([
  ['rmsd', '#67b7dc'],
  ['rgyr', '#67b7dc'],
  ['rgyrx', '#fdd400'],
  ['rgyry', '#84b761'],
  ['rgyrz', '#cc4748'],
  ['time', 'gray'],
]);
