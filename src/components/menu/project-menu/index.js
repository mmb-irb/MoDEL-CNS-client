import React from 'react';

import { Link } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import useAPI from '../../../hooks/use-api';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import style from './style.module.css';

const ProjectMenu = ({ params: { accession, subPage } }) => {
  const { loading, payload } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/`,
  );

  return (
    <Tabs
      value={!loading && subPage}
      indicatorColor="secondary"
      textColor="secondary"
      variant="scrollable"
      scrollButtons="auto"
    >
      <Tab
        component={Link}
        to={`/browse/${accession}/overview`}
        label="overview"
        value="overview"
        className={style['tab-link']}
      />
      <Tab
        component={Link}
        to={`/browse/${accession}/trajectory`}
        label="trajectory"
        value="trajectory"
        className={style['tab-link']}
      />
      {!loading &&
        payload &&
        payload.map(analysis => (
          <Tab
            key={analysis}
            component={Link}
            to={`/browse/${accession}/${analysis}`}
            label={analysis}
            value={analysis}
            className={style['tab-link']}
          />
        ))}
      <Tab
        component={Link}
        to={`/browse/${accession}/files`}
        label="files"
        value="files"
        className={style['tab-link']}
      />
    </Tabs>
  );
};

export default ProjectMenu;
