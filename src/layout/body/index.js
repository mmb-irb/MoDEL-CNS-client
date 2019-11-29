import React from 'react';

import style from './style.module.css';

// Applies specific css style to the whole page body
const Body = React.memo(({ children }) => (
  <div className={style.body}>{children}</div>
));

export default Body;
