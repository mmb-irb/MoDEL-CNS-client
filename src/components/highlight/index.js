import React, { PureComponent } from 'react';
import { escapeRegExp } from 'lodash-es';

export default class Highlight extends PureComponent {
  render() {
    const { highlight, children } = this.props;
    if (!highlight || typeof children !== 'string') return children || null;
    const re = new RegExp(`(${escapeRegExp(highlight)})`, 'i');
    const text = (children || '').toString();
    return text
      .split(re)
      .filter(Boolean)
      .map((chunk, index) =>
        React.createElement(
          re.test(chunk) ? 'mark' : 'span',
          { key: index },
          chunk,
        ),
      );
  }
}
