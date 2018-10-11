import React, { PureComponent } from 'react';

import style from './style.module.css';

export default class Main extends PureComponent {
  render() {
    return (
      <div className={style.main}>{this.props.children}</div>
    );
  }
}

