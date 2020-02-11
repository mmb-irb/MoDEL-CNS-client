import React from 'react';

import { Link } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import useAPI from '../../../hooks/use-api';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import style from './style.module.css';

// Render the menu of the project (i.e. the inferior header)
// It only appears when the user is inside a project
const ProjectMenu = ({ params: { accession, subPage } }) => {
  // Request all the available analyses in this project to the API
  // Then, this menu displays a tab for each analysis
  const { loading, payload, error } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/`,
  );

  if (error) {
    return error.toString();
  }

  // Return each of the menu tabs
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
          // Display a tab for each analysis
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
