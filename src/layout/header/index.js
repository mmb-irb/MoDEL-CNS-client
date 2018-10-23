import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';

import Menu from '../../components/menu';

const Header = () => (
  <AppBar position="sticky">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        MoDEL_CNS
      </Typography>
      <Menu />
    </Toolbar>
  </AppBar>
);

export default Header;
