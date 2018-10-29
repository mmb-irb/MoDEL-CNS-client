import React, { PureComponent } from 'react';
import { Paper, Toolbar } from '@material-ui/core';

import style from './style.module.css';

import logoHBP from '../../images/logo-hbp.png';
import logoIRB from '../../images/logo-irb.png';

export default class Footer extends PureComponent {
  render() {
    return (
      <footer>
        <Paper position="static">
          <Toolbar className={style.footer}>
            <a
              href="https://www.humanbrainproject.eu/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                height="100px"
                src={logoHBP}
                alt="Human Brain Project website"
              />
            </a>
            <a
              href="https://www.irbbarcelona.org/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img height="100px" src={logoIRB} alt="IRB Barcelona website" />
            </a>
          </Toolbar>
        </Paper>
      </footer>
    );
  }
}
