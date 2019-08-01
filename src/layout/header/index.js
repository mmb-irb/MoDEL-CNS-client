import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';

import Menu from '../../components/menu';
import LazyImg from '../../components/lazy-img';

import style from './style.module.css';

import logo from '../../images/logo.png';
import logoWebP from '../../images/logo.webp';

const Header = () => (
  <AppBar position="sticky">
    <Toolbar className={style.toolbar}>
      <picture>
        <source type="image/webp" srcSet={logoWebP} />
        <LazyImg
          src={logo}
          width="200px"
          height="103px"
          loading="lazy"
          alt="MoDEL - Central Nervous System - Logo"
        />
      </picture>
      <Menu />
    </Toolbar>
  </AppBar>
);

export default Header;
