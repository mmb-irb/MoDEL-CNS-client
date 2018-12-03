import { useState, useEffect } from 'react';
import { autoLoad } from 'ngl';

const useNGLFile = (url, options) => {
  const [loading, setLoading] = useState(!!url);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  let canceled = false;

  useEffect(
    () => {
      if (!url) {
        setFile(null);
        return;
      }
      if (error || file) return;

      setLoading(true);
      autoLoad(url, options)
        .then(
          file => !canceled && setFile(file),
          error => !canceled && setError(error),
        )
        .then(() => !canceled && setLoading(false));

      return () => (canceled = true);
    },
    [url],
  );

  return { loading, file, error };
};

export default useNGLFile;
