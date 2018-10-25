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

const NEW_LINE = /\s*\n\s*/;
const rawTextToData = text => {
  const output = {};
  text
    .split(NEW_LINE)
    .filter(Boolean)
    .map(line =>
      line
        .split(',')
        .map(cell => cell.trim())
        .filter(Boolean),
    )
    .forEach(([key, value]) => (output[key] = value));
  return output;
};

class TrajectoryStats extends PureComponent {
  state = { stats: null };
  async componentDidMount() {
    const { accession } = this.props;
    const response = await fetch(BASE_PATH + accession + '/metadata');
    const stats = rawTextToData(await response.text());
    this.setState({ stats });
  }

  render() {
    const { stats } = this.state;
    return (
      <fieldset>
        <legend>
          <Typography variant="h6">Statistics</Typography>
        </legend>
        {stats ? (
          <>
            <fieldset>
              <legend>Counts</legend>
              <TextField
                className={style['text-field']}
                readOnly
                label="Atoms"
                title="Total number of atoms in the system"
                value={stats.SYSTATS}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Proteins"
                title="Number of protein atoms in the system"
                value={stats.PROTATS}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Proteins residues"
                title="Number of protein residues in the system"
                value={stats.PROT}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Membrane molecules"
                title="Number of membrane molecules in the system"
                value={stats.DPPC}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Solvent molecules"
                title="Number of solvent molecules in the system"
                value={stats.SOL}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Positive ions"
                title="Number of positively charged ions in the system"
                value={stats.NA}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Negative ions"
                title="Number of negatively charged ions in the system"
                value={stats.CL}
              />
            </fieldset>
            <fieldset>
              <legend>Simulation box</legend>
              <TextField
                className={style['text-field']}
                readOnly
                label="Type"
                title="Box type"
                value={stats.BOXTYPE}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Size X"
                title="Simulated system box X dimension"
                value={stats.BOXSIZEX}
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
                value={stats.BOXSIZEY}
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
                value={stats.BOXSIZEZ}
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
                  +stats.BOXSIZEX * +stats.BOXSIZEY * +stats.BOXSIZEZ * 1e5,
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
                value={stats.LENGTH}
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
                value={stats.TIMESTEP}
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
                value={stats.SNAPSHOTS}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Frequency"
                title="Frequency of snapshots"
                value={stats.FREQUENCY}
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
                value={stats.FF}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Temperature"
                title="Temperature"
                value={stats.TEMP}
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
                value={stats.WAT}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Ensemble"
                title="Simulation ensemble"
                value={stats.ENSEMBLE}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Pressure coupling"
                title="Pressure coupling method"
                value={stats.PCOUPLING}
              />
              <TextField
                className={style['text-field']}
                readOnly
                label="Membrane"
                title="Membrane type"
                value={stats.MEMBRANE}
              />
            </fieldset>
          </>
        ) : (
          'loading'
        )}
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
    const { ngl, pdbData, match } = this.props;
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
            <TrajectoryStats accession={match.params.accession} />
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
                ngl={ngl}
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
