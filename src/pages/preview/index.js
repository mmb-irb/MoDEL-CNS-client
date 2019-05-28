import React, { useState, Suspense, lazy } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Step,
  StepLabel,
  StepContent,
  Stepper,
  Button,
} from '@material-ui/core';

import style from './style.module.css';

const steps = [
  {
    label: 'Topology',
    Component: lazy(() =>
      import(/* webpackChunkName: 'step-topology' */ './steps/topology'),
    ),
  },
  {
    label: 'Trajectory',
    Component: lazy(() =>
      import(/* webpackChunkName: 'step-trajectory' */ './steps/trajectory'),
    ),
  },
  {
    label: 'Analyses',
    Component: lazy(() =>
      import(/* webpackChunkName: 'step-analyses' */ './steps/analyses'),
    ),
  },
  {
    label: 'Metadata',
    Component: lazy(() =>
      import(/* webpackChunkName: 'step-metadata' */ './steps/metadata'),
    ),
  },
];

const Preview = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Card className={style.card}>
      <CardContent className={style['card-content']}>
        <Typography variant="h5">Submit your data</Typography>
        <Stepper activeStep={currentStep} orientation="vertical">
          {steps.map(({ label, Component }, index, { length }) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Suspense fallback="loading...">
                  <Component />
                </Suspense>
                <div>
                  <Button
                    disabled={!index}
                    onClick={() => setCurrentStep(currentStep => --currentStep)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={index + 1 >= length}
                    onClick={() => setCurrentStep(currentStep => ++currentStep)}
                  >
                    Next
                  </Button>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default Preview;
