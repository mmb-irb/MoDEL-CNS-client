import React, { PureComponent } from 'react';
import cn from 'classnames';
import screenfull from 'screenfull';

import {
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Popover,
  Paper,
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
      <div
        className={cn(style['fullscreen-target'], {
          [style['is-fullscreen']]: isFullscreen,
        })}
        ref={this.#ref}
      >
        <Card>
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
              <OpacitySlider
                title="Change membrane opacity"
                value={membraneOpacity * 100}
                handleChange={this.#handleMembraneOpacityChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
