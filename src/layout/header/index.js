import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';

import Menu from '../../components/menu';
import LazyImg from '../../components/lazy-img';

import style from './style.module.css';

import logo from '../../images/logo.png';

const Header = () => (
  <AppBar position="sticky">
    <Toolbar className={style.toolbar}>
      <LazyImg
        src={logo}
        width="200px"
        height="102.5px"
        loading="lazy"
        alt="MoDEL - Central Nervous System - Logo"
      />
      <Menu />
    </Toolbar>
  </AppBar>
);

export default Header;
