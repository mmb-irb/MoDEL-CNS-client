import { useState, useEffect } from 'react';

const useAPI = url => {
  const [loading, setLoading] = useState(!!url);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  let canceled = false;

  useEffect(
    () => {
      if (!url) {
        setPayload(null);
        return;
      }
      if (error || payload) return;

      const controller = new AbortController();
      setLoading(true);
      fetch(url, { signal: controller.signal })
        .then(
          response => response.json(),
          error => !canceled && setError(error),
        )
        .then(
          payload => !canceled && setPayload(payload),
          error => !canceled && setError(error),
        )
        .then(() => !canceled && setLoading(false));

      return () => {
        canceled = true;
        controller.abort();
      };
    },
    [url],
  );

  return { loading, payload, error };
};

export default useAPI;
