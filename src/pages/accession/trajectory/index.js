import React, { PureComponent } from 'react';
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

import useAPI from '../../../hooks/use-api/index';
import { BASE_PATH } from '../../../utils/constants';

import style from './style.module.css';

class OpacitySlider extends PureComponent {
  state = { element: null };

  #handleOpen = ({ currentTarget: element }) => this.setState({ element });

  #handleClose = () => this.setState({ element: null });

  #handleChange = (_, value) => this.setState({ value });

  render() {
    const { value, handleChange, ...buttonProps } = this.props;
    const { element } = this.state;
    return (
      <>
        <IconButton {...buttonProps} onClick={this.#handleOpen}>
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
          onClose={this.#handleClose}
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
  }
}

class TrajectoryMetadata extends PureComponent {
  render() {
    const { metadata } = this.props;
    return (
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
    );
  }
}

export default class Trajectory extends PureComponent {
  #ref = React.createRef();
  #viewerRef = React.createRef();

  state = {
    progress: 0,
    playing: true,
    smooth: false,
    isFullscreen: screenfull.isFullscreen,
    membraneOpacity: 0.5,
  };

  #toggleFullscreen = () => {
    if (!this.#ref.current) return;
    screenfull.toggle(this.#ref.current);
  };

  #togglePlay = () => {
    this.setState(({ playing }) => ({ playing: !playing }));
  };

  #centerFocus = () => {
    if (this.#viewerRef.current) {
      this.#viewerRef.current.centerFocus();
    }
  };

  #handlePrev = () => {
    if (this.#viewerRef.current) {
      this.#viewerRef.current.currentFrame--;
    }
  };

  #handleNext = () => {
    if (this.#viewerRef.current) {
      this.#viewerRef.current.currentFrame++;
    }
  };

  #toggleSpin = () => {
    if (this.#viewerRef.current) {
      this.#viewerRef.current.toggleSpin();
    }
  };

  #toggleSmooth = () => {
    this.setState(
      ({ smooth }) => ({ smooth: !smooth }),
      () => {
        if (this.#viewerRef.current) {
          this.#viewerRef.current.toggleSmooth(this.state.smooth);
        }
      },
    );
  };

  #handleProgress = progress => this.setState({ progress });

  #handleFullscreenChange = () => {
    this.setState({ isFullscreen: screenfull.isFullscreen });
  };

  #handleManualProgress = ({ clientX, currentTarget }) => {
    const { x, width } = currentTarget.getBoundingClientRect();
    const wantedProgress = (clientX - x) / width;
    this.setState({ playing: false }, () => {
      if (this.#viewerRef.current) {
        this.#viewerRef.current.currentFrame = Math.round(
          wantedProgress * this.#viewerRef.current.totalFrames,
        );
      }
    });
  };

  #handleMembraneOpacityChange = (_, value) =>
    this.setState({ membraneOpacity: value / 100 });

  componentDidMount() {
    screenfull.on('change', this.#handleFullscreenChange);
  }

  componentWillUnmount() {
    screenfull.off('change', this.#handleFullscreenChange);
  }

  render() {
    const { pdbData, metadata, match } = this.props;
    const {
      progress,
      playing,
      isFullscreen,
      smooth,
      membraneOpacity,
    } = this.state;
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
          ref={this.#ref}
        >
          <Card className={style.card}>
            <CardContent className={style['card-content']}>
              <NGLViewer
                accession={match.params.accession}
                pdbData={pdbData}
                isFullscreen={isFullscreen}
                playing={playing}
                membraneOpacity={membraneOpacity}
                onProgress={this.#handleProgress}
                className={style.container}
                ref={this.#viewerRef}
              />
              <div
                className={style.progress}
                onClick={this.#handleManualProgress}
              >
                <LinearProgress
                  variant="determinate"
                  color="secondary"
                  value={progress * 100}
                />
              </div>
              <div>
                <IconButton title="Previous frame" onClick={this.#handlePrev}>
                  <SkipPrevious />
                </IconButton>
                <IconButton
                  title={playing ? 'Pause' : 'Play'}
                  onClick={this.#togglePlay}
                >
                  {playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton title="Next frame" onClick={this.#handleNext}>
                  <SkipNext />
                </IconButton>
                {screenfull.enabled && (
                  <IconButton
                    title={`${isFullscreen ? 'exit' : 'go'} fullscreen`}
                    onClick={this.#toggleFullscreen}
                  >
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                )}
                <IconButton title="Toggle spin" onClick={this.#toggleSpin}>
                  <ThreeSixty />
                </IconButton>
                <IconButton title="Center focus" onClick={this.#centerFocus}>
                  <CenterFocusStrong />
                </IconButton>
                <IconButton
                  title={`Toggle smooth interpolation ${
                    smooth
                      ? 'off'
                      : 'on (may display artifacts for simulation box border atoms)'
                  }`}
                  onClick={this.#toggleSmooth}
                  disabled={!playing}
                >
                  {smooth ? <BurstMode /> : <Videocam />}
                </IconButton>
                {match.params.accession.endsWith('_mb') && (
                  <OpacitySlider
                    title="Change membrane opacity"
                    value={membraneOpacity * 100}
                    handleChange={this.#handleMembraneOpacityChange}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
}
