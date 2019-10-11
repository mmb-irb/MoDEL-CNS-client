import { useEffect, useReducer } from 'react';
import { autoLoad } from 'ngl';

const nglFileReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return { ...state, loading: true, file: null };
    case 'SUCCESS':
      return { ...state, loading: false, file: action.file };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      throw new Error(`"${action.type}" is not a valid action`);
  }
};

const useNGLFile = (url, { defaultRepresentation, ext }) => {
  const [state, dispatch] = useReducer(nglFileReducer, {
    loading: !!url,
    file: null,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      dispatch({ type: 'SUCCESS' });
      return;
    }

    dispatch({ type: 'INIT' });

    let didCancel = false;

    autoLoad(url, { defaultRepresentation, ext })
      .then(file => !didCancel && dispatch({ type: 'SUCCESS', file }))
      .catch(error => !didCancel && dispatch({ type: 'ERROR', error }));

    return () => (didCancel = true);
  }, [url, defaultRepresentation, ext]);

  return state;
};

export default useNGLFile;
