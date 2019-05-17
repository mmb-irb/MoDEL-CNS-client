import testHook from '../../setupTests';

import useProgress from '.';

let progressHook;

describe('useProgress', () => {
  const response = new Response(null, { headers: { 'Content-Length': 100 } });
  beforeAll(() => testHook(() => (progressHook = useProgress(response))));

  it('should have an initial value', () => {
    expect(progressHook).toBeNull();
  });
});
