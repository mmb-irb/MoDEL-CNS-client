import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import cn from 'classnames';
import screenfull from 'screenfull';
import { round } from 'lodash-es';

import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  IconButton,
  Popover,
  Paper,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import {
  SkipPrevious,
  PlayArrow,
  Pause,
  SkipNext,
  Fullscreen,
  FullscreenExit,
  ThreeSixty,
  CenterFocusStrong,
  BurstMode,
  Videocam,
  Flip,
} from '@material-ui/icons';
import { Slider } from '@material-ui/lab';

import NGLViewer from '../../../components/ngl-viewer';

import useToggleState from '../../../hooks/use-toggle-state';

import style from './style.module.css';

const OpacitySlider = memo(({ value, handleChange, ...buttonProps }) => {
  // useState
  const [element, setElement] = useState(null);

  return (
    <>
      <IconButton
        {...buttonProps}
        onClick={useCallback(
          ({ currentTarget }) => setElement(currentTarget),
          [],
        )}
      >
        <Flip />
      </IconButton>
      <Popover
        open={!!element}
        anchorEl={element}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        container={screenfull.element || document.body}
        onClose={useCallback(() => setElement(null), [])}
      >
        <Paper style={{ padding: '1.5em' }}>
          <span>Membrane opacity:</span>
          <Slider
            value={value}
            onChange={handleChange}
            style={{ display: 'inline-block', marginTop: '1.5em' }}
          />
        </Paper>
      </Popover>
    </>
  );
});

const TrajectoryMetadata = memo(({ metadata }) => (
  <fieldset>
    <legend>
      <Typography variant="h6">Statistics</Typography>
    </legend>
    <fieldset>
      <legend>Counts</legend>
      <TextField
        className={style['text-field']}
        readOnly
        label="System atoms"
        title="Total number of atoms in the system"
        value={metadata.SYSTATS}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Proteins atoms"
        title="Number of protein atoms in the system"
        value={metadata.PROTATS}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Proteins residues"
        title="Number of protein residues in the system"
        value={metadata.PROT}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Phospholipids"
        title="Number of membrane molecules in the system"
        value={metadata.DPPC}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Solvent molecules"
        title="Number of solvent molecules in the system"
        value={metadata.SOL}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Positive ions"
        title="Number of positively charged ions in the system"
        value={metadata.NA}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Negative ions"
        title="Number of negatively charged ions in the system"
        value={metadata.CL}
      />
    </fieldset>
    <fieldset>
      <legend>Simulation box</legend>
      <TextField
        className={style['text-field']}
        readOnly
        label="Type"
        title="Box type"
        value={metadata.BOXTYPE}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Size X"
        title="Simulated system box X dimension"
        value={metadata.BOXSIZEX}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              nm
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Size Y"
        title="Simulated system box Y dimension"
        value={metadata.BOXSIZEY}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              nm
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Size Z"
        title="Simulated system box Z dimension"
        value={metadata.BOXSIZEZ}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              nm
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Volume"
        title="Simulated system box volume"
        value={round(
          +metadata.BOXSIZEX * +metadata.BOXSIZEY * +metadata.BOXSIZEZ,
          5,
        )}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              nm³
            </InputAdornment>
          ),
        }}
      />
    </fieldset>
    <fieldset>
      <legend>Other</legend>
      <TextField
        className={style['text-field']}
        readOnly
        label="Length"
        title="Simulation length"
        value={metadata.LENGTH}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              ns
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Timestep"
        title="Simulation timestep"
        value={metadata.TIMESTEP}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              fs
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Snapshots"
        title="Number of snapshots"
        value={metadata.SNAPSHOTS}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Frequency"
        title="Frequency of snapshots"
        value={metadata.FREQUENCY}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              ps
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Force field"
        title="Force field"
        value={metadata.FF}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Temperature"
        title="Temperature"
        value={metadata.TEMP}
        InputProps={{
          endAdornment: (
            <InputAdornment variant="filled" position="end">
              K
            </InputAdornment>
          ),
        }}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Water type"
        title="Water type"
        value={metadata.WAT}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Ensemble"
        title="Simulation ensemble"
        value={metadata.ENSEMBLE}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Pressure coupling"
        title="Pressure coupling method"
        value={metadata.PCOUPLING}
      />
      <TextField
        className={style['text-field']}
        readOnly
        label="Membrane"
        title="Membrane type"
        value={metadata.MEMBRANE}
      />
    </fieldset>
  </fieldset>
));

const Trajectory = ({ pdbData, metadata, match }) => {
  // references
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // toggle states
  const [playing, togglePlaying] = useToggleState(true);
  const [spinning, toggleSpinning] = useToggleState(false);
  const [smooth, toggleSmooth] = useToggleState(false);

  // states
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(screenfull.isFullscreen);
  const [membraneOpacity, setMembraneOpacity] = useState(0.5);

  // handlers
  const handleManualProgress = useCallback(
    ({ buttons, clientX, currentTarget, type }) => {
      if (!viewerRef.current) return;
      if (type === 'mousemove' && buttons !== 1) return;
      const { x, width } = currentTarget.getBoundingClientRect();
      togglePlaying(false);
      viewerRef.current.currentFrame = Math.floor(
        ((clientX - x) / width) * viewerRef.current.totalFrames,
      );
    },
    [],
  );

  const handleFrameChange = useCallback(
    value => {
      if (!viewerRef.current) return;
      togglePlaying(false);
      viewerRef.current.currentFrame += value;
    },
    [viewerRef.current],
  );

  const handleFullscreenChange = useCallback(
    () => setIsFullscreen(screenfull.isFullscreen),
    [],
  );

  // effects
  useEffect(() => {
    screenfull.on('change', handleFullscreenChange);
    return () => screenfull.off('change', handleFullscreenChange);
  }, []);

  return (
    <>
      <Card className={style.card}>
        <CardContent>
          <TrajectoryMetadata metadata={metadata} />
        </CardContent>
      </Card>
      <div
        className={cn(style['fullscreen-target'], {
          [style['is-fullscreen']]: isFullscreen,
        })}
        ref={containerRef}
      >
        <Card className={style.card}>
          <CardContent className={style['card-content']}>
            <NGLViewer
              accession={match.params.accession}
              playing={playing}
              spinning={spinning}
              membraneOpacity={membraneOpacity}
              smooth={smooth}
              onProgress={setProgress}
              className={style.container}
              ref={viewerRef}
            />
            <div
              className={style.progress}
              onClick={handleManualProgress}
              onMouseMove={handleManualProgress}
            >
              <LinearProgress
                variant="determinate"
                color="secondary"
                value={progress * 100}
              />
            </div>
            <div>
              <IconButton
                title="Previous frame"
                onClick={useCallback(() => handleFrameChange(-1), [])}
              >
                <SkipPrevious />
              </IconButton>
              <IconButton
                title={playing ? 'Pause' : 'Play'}
                onClick={togglePlaying}
              >
                {playing ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton
                title="Next frame"
                onClick={useCallback(() => handleFrameChange(1), [])}
              >
                <SkipNext />
              </IconButton>
              {screenfull.enabled && (
                <IconButton
                  title={`${isFullscreen ? 'exit' : 'go'} fullscreen`}
                  onClick={useCallback(() => {
                    if (containerRef.current)
                      screenfull.toggle(containerRef.current);
                  }, [])}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              )}
              <IconButton title="Toggle spin" onClick={toggleSpinning}>
                <ThreeSixty />
              </IconButton>
              <IconButton
                title="Center focus"
                onClick={useCallback(() => {
                  if (viewerRef.current) viewerRef.current.centerFocus();
                }, [])}
              >
                <CenterFocusStrong />
              </IconButton>
              <IconButton
                title={`Toggle smooth interpolation ${
                  smooth
                    ? 'off'
                    : 'on (may display artifacts for simulation box border atoms)'
                }`}
                onClick={toggleSmooth}
                disabled={!playing}
              >
                {smooth ? <BurstMode /> : <Videocam />}
              </IconButton>
              <OpacitySlider
                title="Change membrane opacity"
                value={membraneOpacity * 100}
                handleChange={useCallback(
                  (_, value) => setMembraneOpacity(value / 100),
                  [],
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Trajectory;
