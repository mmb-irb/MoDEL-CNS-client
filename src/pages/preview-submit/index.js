import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  lazy,
  useCallback,
} from 'react';

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

const PreviewSubmit = ({ submitMode, history }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState([]);

  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    // on mount
    // if on mount we were in /submit (because of page refresh, or linking)
    // then replace current location to /preview instead
    if (submitMode) history.replace('/preview');
    // on unmount
    // clean-up references on unmounting
    return () => filesRef.current.forEach(file => URL.revokeObjectURL(file));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const previousStep = useCallback(() => setCurrentStep(step => --step), [
    setCurrentStep,
  ]);
  const nextStep = useCallback(() => setCurrentStep(step => ++step), [
    setCurrentStep,
  ]);

  return (
    <>
      <Typography variant="h4">
        {submitMode ? 'Submit' : 'Preview'} your data
      </Typography>
      <Files files={files} setFiles={setFiles} submitMode={submitMode} />

      <Card className={style.card}>
        <CardHeader title="Preview steps" />
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
                  onClick={nextStep}
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
                <Button onClick={previousStep}>Previous</Button>
                <Button variant="contained" color="primary" onClick={nextStep}>
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
                <Button onClick={previousStep}>Previous</Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    nextStep();
                    history.push('/submit');
                  }}
                >
                  Start submission process
                </Button>
              </StepContent>
            </Step>
            {submitMode && (
              <Step>
                {/* Analyses */}
                <StepLabel>
                  <AnalysesStepLabel />
                </StepLabel>
                <StepContent>
                  <AnalysesStepContent />
                  <Button
                    onClick={() => {
                      previousStep();
                      history.push('/preview');
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                </StepContent>
              </Step>
            )}
            {submitMode && (
              <Step>
                {/* Metadata */}
                <StepLabel>
                  <MetadataStepLabel />
                </StepLabel>
                <StepContent>
                  <MetadataStepContent />
                  <Button onClick={previousStep}>Previous</Button>
                  <Button variant="contained" color="secondary">
                    Submit
                  </Button>
                </StepContent>
              </Step>
            )}
          </Stepper>

          <Button
            variant="contained"
            color={submitMode ? 'secondary' : 'primary'}
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
