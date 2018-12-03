import React from 'react';
import { escapeRegExp } from 'lodash-es';

export default React.memo(({ highlight, children }) => {
  if (!highlight || typeof children !== 'string') return children || null;

  const re = new RegExp(`(${escapeRegExp(highlight)})`, 'i');

  return (children || '')
    .toString()
    .split(re)
    .filter(Boolean)
    .map((chunk, index) =>
      React.createElement(
        re.test(chunk) ? 'mark' : 'span',
        { key: index },
        chunk,
      ),
    );
});
