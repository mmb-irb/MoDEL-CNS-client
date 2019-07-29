import React from 'react';

/**
 * @param {ImgAttr} param0
 */
const LazyImg = ({ loading = 'auto', alt, ...props }) => (
  // @ts-ignore
  <img loading={loading} alt={alt} {...props} />
);

export default LazyImg;
