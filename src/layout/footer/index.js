import React, { PureComponent } from 'react';
import { Paper, Toolbar, Typography } from '@material-ui/core';

export default class Footer extends PureComponent {
  render() {
    return (
      <footer>
        <Paper position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Footer
            </Typography>
          </Toolbar>
        </Paper>
      </footer>
    );
  }
}
