import React, { PureComponent } from 'react';

import style from './style.module.css';

export default class Body extends PureComponent {
  render() {
    return (
      <div className={style.body}>{this.props.children}</div>
    );
  }
}

