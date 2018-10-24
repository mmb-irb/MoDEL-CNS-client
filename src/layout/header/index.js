import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';

import Menu from '../../components/menu';

import logo from '../../images/logo.png';

const Header = () => (
  <AppBar position="sticky">
    <Toolbar>
      <img src={logo} width="200px" alt="MoDEL_CNS" />
      <Menu />
    </Toolbar>
  </AppBar>
);

export default Header;
