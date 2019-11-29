import { useEffect, useReducer } from 'react';
import axios from 'axios';

const emptyOptions = {};

// This logic is used by the "useReducer" and executed by a "dispatch", whcih provides a type (action.type)
// This function expects an initial state and an action which will be used to calculate a new state
// In addition, other variables are calculated and sent back
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
    // An error is sent when the state type is not any of the previous options
    default:
      throw new Error(`"${action.type}" is not a valid action`);
  }
};

// Get data from the API. fetchOptions is optional
const useAPI = (url, fetchOptions = emptyOptions) => {
  // Execute the reducer and declare the variables we expect to recieve from it
  const [state, dispatch] = useReducer(fetchReducer, {
    loading: !!url, // True if url is missing (i.e. null, undefined, '', etc.) or false in all other cases
    payload: null,
    error: null,
    previousPayload: null,
    response: null,
    progress: 0,
  });

  // Tracks the download progress
  // progressEvent is a global method that creates an interface
  const onDownloadProgress = progressEvent =>
    // Check if progress is measurable
    progressEvent.lengthComputable &&
    // If so, send a message with the progress
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

    // This is axios (https://www.npmjs.com/package/axios)
    // Set a cancel option (token). If a request includes this cancel token in its options, the request can be cancelled
    // In order to cancel the request, the same token must be used through axios
    const source = axios.CancelToken.source();
    let didCancel = false;

    // Make a request in a Promise/await way
    axios(url, {
      cancelToken: source.token,
      onDownloadProgress,
      ...fetchOptions,
    })
      // (.then is async) If the request has succeed
      .then(response => !didCancel && dispatch({ type: 'SUCCESS', response }))
      // Otherwise
      .catch(error => !didCancel && dispatch({ type: 'ERROR', error }));

    return () => {
      // Cancel the request
      source.cancel();
      didCancel = true;
    };
  }, [url, fetchOptions]);

  return state;
};

export default useAPI;
