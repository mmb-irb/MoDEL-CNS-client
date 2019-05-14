import { useState, useEffect } from 'react';

const DEFAULT_PROGRESS_RESOLUTION = 0.1;

const getHandleProgress = () => {
  let canceled = false;
  const handleProgress = async (response, setProgress, resolution) => {
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
      if (done || canceled) break;
      received += value.length;
      const progress = received / total;
      if (progress > resolutionIndex * resolution) {
        resolutionIndex = Math.ceil(progress / resolution);
        setProgress(progress);
      }
    }
    if (!canceled) setProgress(1);
  };
  handleProgress.cancel = () => (canceled = true);
  return handleProgress;
};

const useProgress = (response, resolution = DEFAULT_PROGRESS_RESOLUTION) => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!response) return;
    const handleProgress = getHandleProgress();
    handleProgress(response, setProgress, resolution);
    return () => handleProgress.cancel;
  }, [response, resolution]);

  return progress;
};

export default useProgress;
