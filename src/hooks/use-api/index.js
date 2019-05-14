import { useState, useEffect, useRef } from 'react';

const NO_CONTENT = 204;

const emptyArgs = {};
const emptyOptions = {};

const useAPI = (
  url,
  { bodyParser = 'json', fetchOptions = emptyOptions } = emptyArgs,
) => {
  const [state, setState] = useState({
    loading: !!url,
    payload: null,
    error: null,
    previousPayload: null,
    response: null,
  });

  const canceledRef = useRef(false);

  useEffect(() => {
    canceledRef.current = false;
    if (!url) {
      setState(state => ({
        loading: false,
        payload: null,
        error: null,
        previousPayload: state.payload || state.previousPayload,
        response: null,
      }));
      return;
    }

    const controller = new AbortController();
    setState(state => ({
      loading: true,
      payload: null,
      error: null,
      previousPayload: state.payload || state.previousPayload,
      response: null,
    }));
    (async () => {
      let response;
      try {
        response = await fetch(url, {
          signal: controller.signal,
          ...fetchOptions,
        });
        if (response.status === NO_CONTENT) return;
        setState(state => ({ ...state, response }));
        const payload = await ('clone' in response
          ? response.clone()
          : response)[bodyParser]();
        if (canceledRef.current) return;
        setState(state => ({
          loading: false,
          payload,
          error: null,
          previousPayload: state.payload || state.previousPayload,
          response,
        }));
      } catch (error) {
        if (canceledRef.current) return;
        setState(state => ({
          loading: false,
          payload: null,
          error,
          previousPayload: state.payload || state.previousPayload,
          response,
        }));
      }
    })();

    return () => {
      canceledRef.current = true;
      controller.abort();
    };
  }, [url, bodyParser, fetchOptions]);

  return state;
};

export default useAPI;
