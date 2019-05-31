import React, { useState, useMemo } from 'react';

import { partition } from 'lodash-es';

import { Typography, Select, MenuItem } from '@material-ui/core';

const option = file => (
  <MenuItem
    disabled={!file.url}
    key={file.url || file}
    value={file.url || file}
  >
    {file.name || file}
  </MenuItem>
);

const TopologyContent = ({ files }) => {
  const [selected, setSelected] = useState(null);

  const [goodFiles, mehFiles] = useMemo(
    () => partition(files, file => file.category === 'topology'),
    [files],
  );

  return (
    <section>
      <Typography variant="h6">
        Choose which file to use as a topology
      </Typography>
      <div>
        <Select
          name="topology file"
          value={selected || ''}
          onChange={({ target: { value } }) => setSelected(value)}
        >
          {goodFiles.length
            ? option(`Topology file${goodFiles.length === 1 ? '' : 's'}`)
            : null}
          {goodFiles.map(option)};
          {mehFiles.length
            ? option(
                `Other file${
                  goodFiles.length === 1 ? '' : 's'
                } (might not work)`,
              )
            : null}
          {mehFiles.map(option)};
        </Select>
      </div>
    </section>
  );
};

export default TopologyContent;
