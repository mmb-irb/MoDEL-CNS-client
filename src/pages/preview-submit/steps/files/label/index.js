import prettyBytes from 'pretty-bytes';

const FilesLabel = ({ files }) =>
  files.length === 0
    ? 'Files'
    : `${files.length} file${
        files.length === 1 ? '' : 's'
      } available (${prettyBytes(
        files.reduce((acc, { size }) => acc + size, 0),
      )})`;

export default FilesLabel;
