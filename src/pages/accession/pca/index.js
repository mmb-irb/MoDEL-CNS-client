import React, { useContext, useState } from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';

import EigenvalueGraph from '../../../components/eigenvalue-graph/index';
import Projections from '../../../components/projections';

import useAPI from '../../../hooks/use-api/index';

import { AccessionCtx } from '../../../contexts';

import { BASE_PATH_PROJECTS } from '../../../utils/constants';

import style from './style.module.css';

const PCA = () => {
  const accession = useContext(AccessionCtx);

  const { loading, payload } = useAPI(
    `${BASE_PATH_PROJECTS}${accession}/analyses/pca/`,
  );

  const [projections, setProjections] = useState([0, 1]);

  if (loading) return 'loading';

  return (
    <>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">PCA eigenvalues</Typography>
          <EigenvalueGraph
            data={payload.y}
            projections={projections}
            setProjections={setProjections}
          />
        </CardContent>
      </Card>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">PCA projections</Typography>
          <Projections data={payload.y} projections={projections} />
        </CardContent>
      </Card>
    </>
  );
};

export default PCA;
