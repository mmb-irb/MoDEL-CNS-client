import { useState, useEffect, useRef } from 'react';
import { sleep } from 'timing-functions';

const NO_CONTENT = 204;

const useAPI = url => {
  const [state, setState] = useState({
    loading: !!url,
    payload: null,
    error: null,
    previousPayload: null,
  });

  let canceled = false;

  useEffect(
    () => {
      if (!url) {
        setState({
          loading: false,
          payload: null,
          error: null,
          previousPayload: state.payload || state.previousPayload,
        });
        return;
      }

      const controller = new AbortController();
      setState({
        ...state,
        loading: true,
        payload: null,
        error: null,
        previousPayload: state.payload || state.previousPayload,
      });
      fetch(url, { signal: controller.signal })
        .then(
          response => (response.status === NO_CONTENT ? null : response.json()),
          error =>
            !canceled &&
            setState({
              loading: false,
              payload: null,
              error,
              previousPayload: state.payload || state.previousPayload,
            }),
        )
        .then(
          payload => {
            if (canceled) return;
            setState({
              loading: false,
              payload,
              error: null,
              previousPayload: state.payload || state.previousPayload,
            });
          },
          error =>
            !canceled &&
            setState({
              loading: false,
              payload: null,
              error,
              previousPayload: state.payload || state.previousPayload,
            }),
        );

      return () => {
        canceled = true;
        controller.abort();
      };
    },
    [url],
  );

  return { ...state };
};

export default useAPI;
