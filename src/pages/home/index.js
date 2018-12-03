import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Fab, Typography } from '@material-ui/core';

import style from './style.module.css';

import homeImage from '../../images/home-image.png';

const Home = () => (
  <>
    <Card className={style.card}>
      <CardContent className={style['card-content']}>
        <img src={homeImage} alt="home page" />
        <Typography variant="h5">
          <strong>MoDEL_CNS</strong> is a platform designed to provide
          web-access to <strong>atomistic-MD trajectories</strong> for relevant{' '}
          <strong>signal transduction proteins</strong>.
        </Typography>
        <Typography variant="h5">
          The project is part of the Service for providing molecular
          simulation-based predictions for systems neurobiology of the{' '}
          <strong>Human Brain Project</strong>.
        </Typography>
        <Typography variant="h5">
          <strong>MoDEL_CNS</strong> expands the <strong>M</strong>
          olecular <strong>D</strong>
          ynamics <strong>E</strong>
          xtended <strong>L</strong>
          ibrary (
          <a
            href="http://mmb.pcb.ub.es/MoDEL/"
            target="_blank"
            rel="noopener noreferrer"
          >
            MoDEL
          </a>
          ) database of atomistic Molecular Dynamics trajectories with proteins
          involved in <strong>Central Nervous System</strong> (CNS) processes,
          including membrane proteins.
        </Typography>
        <Typography variant="h5">
          <strong>MoDEL_CNS web server interface</strong> presents the resulting
          trajectories, analyses, and protein properties. All data produced by
          the project is available to download.
        </Typography>
        <Typography variant="h5" className={style['with-background']}>
          <strong>MoDEL_CNS</strong> will contribute in the improvement of the
          understanding of neuronal signalling cascades by protein
          structure-based simulations, calculating molecular flexibility and
          dynamics, and guiding systems level modelling.
        </Typography>
      </CardContent>
    </Card>
    <Fab
      className={style['browse-fab']}
      component={Link}
      to="/browse"
      variant="extended"
      color="primary"
    >
      Browse
    </Fab>
  </>
);

export default Home;
