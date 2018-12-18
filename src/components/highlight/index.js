import React from 'react';
import { escapeRegExp } from 'lodash-es';

import style from './style.module.css';

const spaces = /\s+/;

export default React.memo(({ highlight, children }) => {
  if (!highlight || typeof children !== 'string') return children || null;

  const re = new RegExp(
    `(${highlight
      .trim()
      .split(spaces)
      .map(escapeRegExp)
      .join('|')})`,
    'i',
  );

  return (
    <span className={style.higlightable}>
      {(children || '')
        .toString()
        .split(re)
        .filter(Boolean)
        .map((chunk, index) =>
          React.createElement(
            re.test(chunk) ? 'mark' : 'span',
            { key: index },
            chunk,
          ),
        )}
    </span>
  );
});
