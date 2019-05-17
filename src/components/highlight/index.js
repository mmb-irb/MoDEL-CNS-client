import React from 'react';
import { escapeRegExp, memoize } from 'lodash-es';

import style from './style.module.css';

const spaces = /\s+/;
const getRegExFor = memoize(
  highlight =>
    new RegExp(
      `(${highlight
        .toString()
        .trim()
        .split(spaces)
        .map(escapeRegExp)
        .join('|')})`,
      'i',
    ),
);

export default React.memo(({ highlight, children }) => {
  if (
    !highlight ||
    !children ||
    !(typeof children === 'string' || Number.isFinite(children))
  ) {
    return children || null;
  }

  const re = getRegExFor(highlight);

  return (
    <span className={style.highlightable}>
      {children
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
