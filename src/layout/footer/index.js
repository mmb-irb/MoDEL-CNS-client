import React from 'react';
import { Paper, Toolbar } from '@material-ui/core';

import LazyImg from '../../components/lazy-img';

import style from './style.module.css';

import logoHBP from '../../images/logo-hbp.png';
import logoIRB from '../../images/logo-irb.png';
import logoHBPWebP from '../../images/logo-hbp.webp';
import logoIRBWebP from '../../images/logo-irb.webp';

// for (const img of [logoHBP, logoIRB]) {
//   const el = document.createElement('link');
//   el.rel = 'preload';
//   el.as = 'image';
//   el.href = img;
//   document.head.appendChild(el);
// }

const Footer = React.memo(() => (
  <footer>
    <Paper>
      <Toolbar className={style.footer}>
        <a
          href="https://www.humanbrainproject.eu/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <picture>
            <source type="image/webp" srcSet={logoHBPWebP} />
            <LazyImg
              height="100px"
              src={logoHBP}
              loading="lazy"
              alt="Human Brain Project website"
            />
          </picture>
        </a>
        <a
          href="https://www.irbbarcelona.org/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <picture>
            <source type="image/webp" srcSet={logoIRBWebP} />
            <LazyImg
              height="100px"
              src={logoIRB}
              loading="lazy"
              alt="IRB Barcelona website"
            />
          </picture>
        </a>
      </Toolbar>
    </Paper>
  </footer>
));

export default Footer;
