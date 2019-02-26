import React, {
  memo,
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

import {
  CardContent,
  LinearProgress,
  IconButton,
  Popover,
  Paper,
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
  Flip,
} from '@material-ui/icons';
import { Slider } from '@material-ui/lab';

import NGLViewer from '../ngl-viewer';

import useToggleState from '../../hooks/use-toggle-state';

import connectionLevel, {
  LOW,
  MEDIUM,
  HIGH,
} from '../../utils/connection-level';

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
        data-popover
        container={screenfull.element || document.body}
        onClose={useCallback(() => setElement(null), [])}
      >
        <Paper className={style['popover-paper']}>
          <span>Membrane opacity:</span>
          <Slider
            value={value}
            onChange={handleChange}
            className={style['popover-slider']}
          />
        </Paper>
      </Popover>
    </>
  );
});

const NGLViewerWithControls = forwardRef(
  ({ className, startsPlaying = true, noTrajectory, ...props }, ref) => {
    // references
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    // toggle states
    const [playing, togglePlaying] = useToggleState(startsPlaying);
    const [spinning, toggleSpinning] = useToggleState(false);
    const [smooth, toggleSmooth] = useToggleState(false);

    // states
    const [progress, setProgress] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(screenfull.isFullscreen);
    const [membraneOpacity, setMembraneOpacity] = useState(0.5);
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

    useImperativeHandle(ref, () => ({
      autoResize: viewerRef.current.autoResize,
    }));

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
            {...props}
          />
          {noTrajectory || (
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
          )}
          <div className={style.controls}>
            {noTrajectory || (
              <>
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
            <OpacitySlider
              className={style['opacity-slider']}
              title="Change membrane opacity"
              value={membraneOpacity * 100}
              handleChange={useCallback(
                (_, value) => setMembraneOpacity(value / 100),
                [],
              )}
            />
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
          </div>
        </CardContent>
      </div>
    );
  },
);

export default NGLViewerWithControls;
