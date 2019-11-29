import React from 'react';
import { CardContent, Typography } from '@material-ui/core';

import Card from '../../components/animated-card';

import style from './style.module.css';

// Expose a link to get in touch with the IRB group
const Contact = () => (
  <Card className={style.card}>
    <CardContent className={style['card-content']}>
      <Typography variant="h5">Get in touch with us</Typography>
      <a
        href="http://mmb.irbbarcelona.org/www/locationmap"
        target="_blank"
        rel="noopener noreferrer"
      >
        See on the IRB Molecular Modeling and Bioinformatics group website
      </a>
    </CardContent>
  </Card>
);

export default Contact;
