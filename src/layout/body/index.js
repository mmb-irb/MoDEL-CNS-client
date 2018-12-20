import React from 'react';

import style from './style.module.css';

const Body = React.memo(({ children }) => (
  <div className={style.body}>{children}</div>
));

export default Body;
