import { useEffect, useReducer } from 'react';
import axios from 'axios';

const emptyOptions = {};

const fetchReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        loading: true,
        previousPayload: state.payload || state.previousPayload,
        payload: null,
      };
    case 'PROGRESS':
      return { ...state, progress: action.progress };
    case 'SUCCESS':
      return {
        ...state,
        loading: false,
        payload: action.response.data || null,
        response: action.response,
        progress: 1,
      };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      throw new Error(`"${action.type}" is not a valid action`);
  }
};

const useAPI = (url, fetchOptions = emptyOptions) => {
  const [state, dispatch] = useReducer(fetchReducer, {
    loading: !!url,
    payload: null,
    error: null,
    previousPayload: null,
    response: null,
    progress: 0,
  });

  const onDownloadProgress = progressEvent =>
    progressEvent.lengthComputable &&
    dispatch({
      type: 'PROGRESS',
      progress: progressEvent.loaded / progressEvent.total,
    });

  useEffect(() => {
    if (!url) {
      dispatch({ type: 'SUCCESS' });
      return;
    }

    dispatch({ type: 'INIT' });

    const source = axios.CancelToken.source();
    let didCancel = false;

    axios(url, {
      cancelToken: source.token,
      onDownloadProgress,
      ...fetchOptions,
    })
      .then(response => !didCancel && dispatch({ type: 'SUCCESS', response }))
      .catch(error => !didCancel && dispatch({ type: 'ERROR', error }));

    return () => {
      source.cancel();
      didCancel = true;
    };
  }, [url, fetchOptions]);

  return state;
};

export default useAPI;
