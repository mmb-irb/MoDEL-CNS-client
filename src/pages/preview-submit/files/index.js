import React, { useRef, useState, useEffect } from 'react';

import { Card, CardHeader, CardContent, Fab, Chip } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLock } from '@fortawesome/free-solid-svg-icons';

import cn from 'classnames';
import prettyBytes from 'pretty-bytes';

import style from './style.module.css';

const stop = decoratedFunction => event => {
  event.preventDefault();
  event.stopPropagation();
  if (decoratedFunction) return decoratedFunction(event);
};

const mergeFiles = (newFiles, setFiles) =>
  setFiles(files => [
    ...files,
    ...Array.from(newFiles).map(file => ({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    })),
  ]);

const stopEvent = stop();

const Files = ({ files, setFiles, submitMode }) => {
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleDelete = fileToDelete =>
    stop(() =>
      setFiles(files => {
        if (!files.includes(fileToDelete)) return files;
        const newList = files.filter(file => file !== fileToDelete);
        URL.revokeObjectURL(fileToDelete.url);
        return newList;
      }),
    );

  useEffect(() => {
    const startDragging = stop(() => setIsDragging(true));
    const stopDragging = stop(() => setIsDragging(false));
    window.document.addEventListener('dragover', startDragging);
    window.document.addEventListener('dragenter', startDragging);
    window.document.addEventListener('dragleave', stopDragging);
    window.document.addEventListener('dragend', stopDragging);
    window.document.addEventListener('drop', stopDragging);
    return () => {
      window.document.removeEventListener('dragover', startDragging);
      window.document.removeEventListener('dragenter', startDragging);
      window.document.removeEventListener('dragleave', stopDragging);
      window.document.removeEventListener('dragend', stopDragging);
      window.document.removeEventListener('drop', stopDragging);
    };
  }, []);

  return (
    <label
      onDrag={stopEvent}
      onDragStart={stopEvent}
      onDragEnd={stopEvent}
      onDragOver={stopEvent}
      onDragEnter={stopEvent}
      onDragLeave={stopEvent}
      onDrop={stop(event => mergeFiles(event.dataTransfer.files, setFiles))}
      className={cn(style.container, { [style['is-dragging']]: isDragging })}
    >
      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        onChange={stop(({ target: { files } }) => mergeFiles(files, setFiles))}
      />
      <Card className={style.card}>
        <CardHeader
          title="Provide your files"
          subheader={
            <span>
              <em>Drag & drop</em> the files you will need to{' '}
              {submitMode ? 'submit' : 'use'} or <em>click</em> to add them
            </span>
          }
        />
        <CardContent className={style['card-content']}>
          {files.map(file => (
            <Chip
              className={style.chip}
              clickable={false}
              key={file.url}
              label={`${file.name} (${prettyBytes(file.size)})`}
              onClick={stopEvent}
              deleteIcon={
                submitMode ? <FontAwesomeIcon icon={faLock} /> : undefined
              }
              onDelete={submitMode ? stopEvent : handleDelete(file)}
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
          <FontAwesomeIcon icon={faPlus} />
        </Fab>
      </Card>
    </label>
  );
};

export default Files;
