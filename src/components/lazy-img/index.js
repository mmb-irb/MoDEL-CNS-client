import React from 'react';

/**
 * @param {{loading: 'auto' | 'lazy' | 'eager'}} param0
 */
const LazyImg = ({ loading = 'auto', alt, ...props }) => (
  // @ts-ignore
  <img loading={loading} alt={alt} {...props} />
);

export default LazyImg;
