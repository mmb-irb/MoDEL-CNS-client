import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Step,
  StepLabel,
  StepContent,
  Stepper,
  Button,
} from '@material-ui/core';

import Files from './files';

import style from './style.module.css';

const wrapAsyncComponents = moduleImport => props => {
  const LazyLoaded = lazy(moduleImport);
  return (
    <Suspense fallback={null}>
      <LazyLoaded {...props} />
    </Suspense>
  );
};

// STEPS
// files
const FilesStepLabel = wrapAsyncComponents(() =>
  import(/* webpackChunkName: 'step-files-label' */ './steps/files/label'),
);
const FilesStepContent = wrapAsyncComponents(() =>
  import(/* webpackChunkName: 'step-files-content' */ './steps/files/content'),
);

// topology
const TopologyStepLabel = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-topology-label' */ './steps/topology/label'
  ),
);
const TopologyStepContent = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-topology-content' */ './steps/topology/content'
  ),
);

// trajectory
const TrajectoryStepLabel = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-trajectory-label' */ './steps/trajectory/label'
  ),
);
const TrajectoryStepContent = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-trajectory-content' */ './steps/trajectory/content'
  ),
);

// analyses
const AnalysesStepLabel = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-analyses-label' */ './steps/analyses/label'
  ),
);
const AnalysesStepContent = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-analyses-content' */ './steps/analyses/content'
  ),
);

// metadata
const MetadataStepLabel = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-metadata-label' */ './steps/metadata/label'
  ),
);
const MetadataStepContent = wrapAsyncComponents(() =>
  import(
    /* webpackChunkName: 'step-metadata-content' */ './steps/metadata/content'
  ),
);

const PreviewSubmit = ({ submitMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState([]);

  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // clean-up references on unmounting
  useEffect(
    () => () => filesRef.current.forEach(file => URL.revokeObjectURL(file)),
    [],
  );

  return (
    <>
      <Typography variant="h4">
        {submitMode ? 'Submit' : 'Preview'} your data
      </Typography>
      <Files files={files} setFiles={setFiles} submitMode={submitMode} />

      <Card className={style.card}>
        <CardHeader title="Submission steps" />
        <CardContent className={style['card-content']}>
          <Stepper activeStep={currentStep} orientation="vertical">
            {/* Files */}
            <Step>
              <StepLabel>
                <FilesStepLabel files={files} />
              </StepLabel>
              <StepContent>
                <FilesStepContent />
                <Button
                  variant="contained"
                  disabled={!files.length}
                  color="primary"
                  onClick={() => setCurrentStep(c => ++c)}
                >
                  Next
                </Button>
              </StepContent>
            </Step>
            {/* Topology */}
            <Step>
              <StepLabel>
                <TopologyStepLabel />
              </StepLabel>
              <StepContent>
                <TopologyStepContent />
                <Button onClick={() => setCurrentStep(c => --c)}>
                  Previous
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setCurrentStep(c => ++c)}
                >
                  Next
                </Button>
              </StepContent>
            </Step>
            {/* Trajectory */}
            <Step>
              <StepLabel>
                <TrajectoryStepLabel />
              </StepLabel>
              <StepContent>
                <TrajectoryStepContent />
                <Button onClick={() => setCurrentStep(c => --c)}>
                  Previous
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setCurrentStep(c => ++c)}
                >
                  Next
                </Button>
              </StepContent>
            </Step>
            {/* Analyses */}
            <Step>
              <StepLabel>
                <AnalysesStepLabel />
              </StepLabel>
              <StepContent>
                <AnalysesStepContent />
                <Button onClick={() => setCurrentStep(c => --c)}>
                  Previous
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setCurrentStep(c => ++c)}
                >
                  Next
                </Button>
              </StepContent>
            </Step>
            {/* Metadata */}
            <Step>
              <StepLabel>
                <MetadataStepLabel />
              </StepLabel>
              <StepContent>
                <MetadataStepContent />
                <Button onClick={() => setCurrentStep(c => --c)}>
                  Previous
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setCurrentStep(c => ++c)}
                >
                  Submit
                </Button>
              </StepContent>
            </Step>
          </Stepper>

          <Button
            variant="contained"
            color="primary"
            disabled={currentStep === 0 && !files.length}
            onClick={() => {
              setCurrentStep(0);
              setFiles([]);
            }}
          >
            Reset all
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default PreviewSubmit;
