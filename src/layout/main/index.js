import React from 'react';

import style from './style.module.css';

// Applies specific css style to the all the web page but the header and the footer
// Maintain the width of the body idependently of the screed width
// Maintain the position of the footer
const Main = ({ children }) => <main className={style.main}>{children}</main>;

export default Main;
