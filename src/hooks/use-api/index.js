import { useState, useEffect, useRef } from 'react';

const NO_CONTENT = 204;

const DEFAULT_PROGRESS_RESOLUTION = 0.1;

const handleProgress = async (setState, response, resolution, canceledRef) => {
  if (!('clone' in response)) return; // bail
  const total = +response.headers.get('content-length');
  if (!(total && Number.isFinite(total))) return; // bail
  let received = 0;
  let resolutionIndex = 0;
  const clone = response.clone();
  if (!('body' in clone && 'getReader' in clone.body)) return; // bail
  const reader = clone.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done || canceledRef.current) break;
    received += value.length;
    const progress = received / total;
    if (progress > resolutionIndex * resolution) {
      resolutionIndex = Math.ceil(progress / resolution);
      setState(state => ({ ...state, progress }));
    }
  }
  if (!canceledRef.current) setState(state => ({ ...state, progress: 1 }));
};

const useAPI = (
  url,
  { bodyParser = 'json', fetchOptions = {}, withProgress = false } = {},
) => {
  const [state, setState] = useState({
    loading: !!url,
    payload: null,
    error: null,
    previousPayload: null,
    progress: null,
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
        progress: null,
      }));
      return;
    }

    const controller = new AbortController();
    setState(state => ({
      loading: true,
      payload: null,
      error: null,
      previousPayload: state.payload || state.previousPayload,
      progress: 0,
    }));
    fetch(url, { signal: controller.signal, ...fetchOptions })
      .then(
        response => {
          if (response.status === NO_CONTENT) return;
          if (withProgress) {
            handleProgress(
              setState,
              response,
              Number.isFinite(withProgress)
                ? withProgress
                : DEFAULT_PROGRESS_RESOLUTION,
              canceledRef,
            );
          }
          return response[bodyParser]();
        },
        error =>
          !canceledRef.current &&
          setState(state => ({
            loading: false,
            payload: null,
            error,
            previousPayload: state.payload || state.previousPayload,
            progress: null,
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
            progress: state.progress,
          }));
        },
        error => {
          if (canceledRef.current) return;
          setState(state => ({
            loading: false,
            payload: null,
            error,
            previousPayload: state.payload || state.previousPayload,
            progress: null,
          }));
        },
      );

    return () => {
      canceledRef.current = true;
      controller.abort();
    };
  }, [url]);

  return { ...state };
};

export default useAPI;
