import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import cn from 'classnames';
import screenfull from 'screenfull';
import { schedule } from 'timing-functions';

import {
  CardContent,
  LinearProgress,
  IconButton,
  Select,
  FormControl,
  InputLabel,
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
  InvertColors,
  Layers,
  LayersClear,
  Close,
} from '@material-ui/icons';

import Slider from '../slider';

import { get, set } from '../../utils/storage/index';
import NGLViewer from '../ngl-viewer';

import useToggleState from '../../hooks/use-toggle-state';

import connectionLevel, {
  LOW,
  MEDIUM,
  HIGH,
} from '../../utils/connection-level';

import style from './style.module.css';

const NGLViewerWithControls = forwardRef(
  (
    {
      className,
      startsPlaying = true,
      noTrajectory,
      close,
      projection,
      ...props
    },
    ref,
  ) => {
    // references
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    // toggle states
    const [playing, togglePlaying] = useToggleState(startsPlaying);
    const [spinning, toggleSpinning] = useToggleState(false);
    const [smooth, toggleSmooth] = useToggleState(false);
    const [darkBackground, toggleDarkBackground] = useToggleState(
      useMemo(() => get('dark-background', true), []),
    );
    const [perspective, togglePerspective] = useToggleState(
      useMemo(() => get('perspective', false), []),
    );

    // states
    const [progress, setProgress] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(screenfull.isFullscreen);
    const [membraneOpacity, setMembraneOpacity] = useState(
      Number.isFinite(projection)
        ? 0
        : useMemo(() => get('membrane-opacity', 0.5), []),
    );
    const [nFrames, setNFrames] = useState(
      useMemo(() => {
        switch (connectionLevel()) {
          case HIGH:
            return 50;
          case MEDIUM:
            return 25;
          case LOW:
          default:
            return 10;
        }
      }, []),
    );

    // handlers
    // handle click or click & drag progress bar
    const handleManualProgress = useCallback(
      ({ buttons, clientX, currentTarget, type }) => {
        if (!viewerRef.current) return;
        // if mousemove event, but the main button is not pressed, bail
        if (type === 'mousemove' && buttons !== 1) return;
        const { x, width } = currentTarget.getBoundingClientRect();
        togglePlaying(false);
        viewerRef.current.currentFrame = Math.floor(
          ((clientX - x) / width) * viewerRef.current.totalFrames,
        );
      },
      [togglePlaying],
    );

    const handleFrameChange = useCallback(
      value => {
        if (!viewerRef.current) return;
        togglePlaying(false);
        viewerRef.current.currentFrame += value;
      },
      [togglePlaying],
    );

    const handleFullscreenChange = useCallback(
      () => setIsFullscreen(screenfull.isFullscreen),
      [],
    );

    // effects
    useEffect(() => {
      screenfull.on('change', handleFullscreenChange);
      return () => screenfull.off('change', handleFullscreenChange);
    }, [handleFullscreenChange]);

    useImperativeHandle(
      ref,
      () => ({
        autoResize: viewerRef.current.autoResize,
        centerFocus: viewerRef.current.centerFocus,
      }),
      [],
    );

    return (
      <div
        className={cn(style['fullscreen-target'], {
          [style['is-fullscreen']]: isFullscreen,
        })}
        ref={containerRef}
      >
        <CardContent className={cn(style['card-content'], className)}>
          <NGLViewer
            playing={playing}
            spinning={spinning}
            membraneOpacity={membraneOpacity}
            smooth={smooth}
            onProgress={setProgress}
            ref={viewerRef}
            noTrajectory={noTrajectory}
            nFrames={nFrames}
            darkBackground={darkBackground}
            perspective={perspective}
            projection={projection}
            {...props}
          />
          {noTrajectory || (
            <div
              className={cn(style.progress, { [style.dark]: darkBackground })}
              onClick={handleManualProgress}
              onMouseMove={handleManualProgress}
            >
              <LinearProgress
                variant="determinate"
                color="secondary"
                value={progress * 100}
              />
            </div>
          )}
          <div className={style.controls}>
            {close && (
              <IconButton title="Close viewer" onClick={close}>
                <Close />
              </IconButton>
            )}
            {noTrajectory || (
              <>
                <IconButton
                  title="Previous frame"
                  onClick={useCallback(() => handleFrameChange(-1), [
                    handleFrameChange,
                  ])}
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
                  onClick={useCallback(() => handleFrameChange(1), [
                    handleFrameChange,
                  ])}
                >
                  <SkipNext />
                </IconButton>
              </>
            )}
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
            <IconButton
              title="Invert background color"
              onClick={() => {
                toggleDarkBackground();
                schedule(1000).then(() =>
                  set('dark-background', !darkBackground),
                );
              }}
              className={cn(style['background-toggle'], {
                [style['dark']]: darkBackground,
              })}
            >
              <InvertColors />
            </IconButton>
            <IconButton
              title={`Switch to ${
                perspective ? 'ortographic' : 'perspective'
              } view`}
              onClick={() => {
                togglePerspective();
                schedule(1000).then(() => set('perspective', !perspective));
              }}
            >
              {perspective ? <Layers /> : <LayersClear />}
            </IconButton>
            {!Number.isFinite(projection) && (
              <Slider
                className={style['opacity-slider']}
                label="Membrane label:"
                title="Change membrane opacity"
                value={membraneOpacity * 100}
                handleChange={(_, value) => {
                  setMembraneOpacity(value / 100);
                  schedule(1000).then(() =>
                    set('membrane-opacity', value / 100),
                  );
                }}
              />
            )}

            {!Number.isFinite(projection) && !noTrajectory && (
              <FormControl>
                <InputLabel>frames</InputLabel>
                <Select
                  native
                  value={nFrames}
                  onChange={({ target: { value } }) => setNFrames(value)}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </Select>
              </FormControl>
            )}
          </div>
        </CardContent>
      </div>
    );
  },
);

export default NGLViewerWithControls;
