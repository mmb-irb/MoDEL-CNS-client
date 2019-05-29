import React, { useRef, useCallback } from 'react';

import { Card, CardHeader, CardContent, Fab, Chip } from '@material-ui/core';
import { Add } from '@material-ui/icons';

import prettyBytes from 'pretty-bytes';

import style from './style.module.css';

const Files = ({ files, setFiles, submitMode }) => {
  const fileInputRef = useRef(null);

  const handleChange = useCallback(
    ({ target }) => {
      setFiles(files => [
        ...files,
        ...Array.from(target.files).map(file => ({
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
        })),
      ]);
    },
    [setFiles],
  );

  const handleDelete = fileToDelete => event => {
    event.preventDefault();
    setFiles(files => {
      if (!files.includes(fileToDelete)) return files;
      const newList = files.filter(file => file !== fileToDelete);
      URL.revokeObjectURL(fileToDelete.url);
      return newList;
    });
  };

  return (
    <label>
      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        onChange={handleChange}
      />
      <Card className={style.card}>
        <CardHeader
          title="Provide your files"
          subheader={`Put here the files you need to ${
            submitMode ? 'submit' : 'use'
          }`}
        />
        <CardContent className={style['card-content']}>
          {files.map((file, i) => (
            <Chip
              className={style.chip}
              clickable={false}
              key={file.url}
              label={`${file.name} (${prettyBytes(file.size)})`}
              onClick={event => event.preventDefault()}
              onDelete={handleDelete(file)}
            />
          ))}
        </CardContent>
        <Fab
          aria-label="Add file"
          color="primary"
          size="small"
          className={style.fab}
          onClick={() => fileInputRef.current.click()}
        >
          <Add />
        </Fab>
      </Card>
    </label>
  );
};

export default Files;
