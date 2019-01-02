import { useState, useEffect, useRef } from 'react';

const NO_CONTENT = 204;

const useAPI = url => {
  const [state, setState] = useState({
    loading: !!url,
    payload: null,
    error: null,
    previousPayload: null,
  });

  const canceledRef = useRef(false);

  useEffect(
    () => {
      if (!url) {
        setState(state => ({
          loading: false,
          payload: null,
          error: null,
          previousPayload: state.payload || state.previousPayload,
        }));
        return;
      }

      const controller = new AbortController();
      setState(state => ({
        loading: true,
        payload: null,
        error: null,
        previousPayload: state.payload || state.previousPayload,
      }));
      fetch(url, { signal: controller.signal })
        .then(
          response => (response.status === NO_CONTENT ? null : response.json()),
          error =>
            !canceledRef.current &&
            setState(state => ({
              loading: false,
              payload: null,
              error,
              previousPayload: state.payload || state.previousPayload,
            })),
        )
        .then(
          payload => {
            if (canceledRef.current) return;
            setState(state => ({
              loading: false,
              payload,
              error: null,
              previousPayload: state.payload || state.previousPayload,
            }));
          },
          error => {
            if (canceledRef.current) return;
            setState(state => ({
              loading: false,
              payload: null,
              error,
              previousPayload: state.payload || state.previousPayload,
            }));
          },
        );

      return () => {
        canceledRef.current = true;
        controller.abort();
      };
    },
    [url],
  );

  return { ...state };
};

export default useAPI;
