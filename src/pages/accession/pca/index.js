import React, { useContext, useState, useMemo } from 'react';
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

  const [explanation, totalEigenvalue] = useMemo(() => {
    if (!payload) return [];
    const values = Object.values(payload.y);
    const totalEigenvalue = values.reduce(
      (acc, component) => acc + component.eigenvalue,
      0,
    );
    const explanation =
      (values[projections[0]].eigenvalue + values[projections[1]].eigenvalue) /
      totalEigenvalue;
    return [explanation, totalEigenvalue];
  }, [payload, projections]);

  if (loading) return 'loading';

  return (
    <>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">PCA eigenvalues</Typography>
          <EigenvalueGraph
            data={payload.y}
            totalEigenvalue={totalEigenvalue}
            projections={projections}
            setProjections={setProjections}
          />
        </CardContent>
      </Card>
      <Card className={style.card}>
        <CardContent>
          <Typography variant="h6">PCA projections</Typography>
          <p>
            Showing principal components {projections[0] + 1} and{' '}
            {projections[1] + 1}, accounting for{' '}
            {Math.round(explanation * 1000) / 10}% of explained variance
          </p>
          <Projections data={payload.y} projections={projections} />
        </CardContent>
      </Card>
    </>
  );
};

export default PCA;
