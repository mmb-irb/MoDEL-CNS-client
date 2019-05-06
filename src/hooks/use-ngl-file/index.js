import { useState, useEffect, useRef } from 'react';
import { autoLoad } from 'ngl';

const useNGLFile = (url, { defaultRepresentation, ext }) => {
  const [state, setState] = useState({
    loading: !!url,
    file: null,
    error: null,
  });

  const canceledRef = useRef(false);

  useEffect(() => {
    if (!url) {
      setState({
        loading: false,
        file: null,
        error: null,
      });
      return;
    }

    setState({
      loading: true,
      file: null,
      error: null,
    });
    autoLoad(url, { defaultRepresentation, ext }).then(
      file => {
        if (canceledRef.current) return;
        setState({
          loading: false,
          file,
          error: null,
        });
      },
      error => {
        if (canceledRef.current) return;
        setState({
          loading: false,
          file: null,
          error,
        });
      },
    );

    return () => (canceledRef.current = true);
  }, [url, defaultRepresentation, ext]);

  return { ...state };
};

export default useNGLFile;
