import React from 'react';

/**
 * @param {{loading: 'auto' | 'lazy' | 'eager'}} param0
 */
const LazyImg = ({ loading = 'auto', ...props }) => (
  // @ts-ignore
  <img loading={loading} {...props} />
);

export default LazyImg;
