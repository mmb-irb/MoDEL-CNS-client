import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';

import Menu from '../../components/menu';

import logo from '../../images/logo.png';

const Header = () => (
  <AppBar position="sticky">
    <Toolbar>
      <img
        src={logo}
        width="200px"
        height="102.5px"
        loading="lazy"
        alt="MoDEL - Centra Nervous System - Logo"
      />
      <Menu />
    </Toolbar>
  </AppBar>
);

export default Header;
