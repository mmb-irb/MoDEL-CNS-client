import React, {
  PureComponent,
  forwardRef,
  memo,
  useRef,
  useImperativeMethods,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { debounce, throttle, clamp } from 'lodash-es';
import cn from 'classnames';
import * as ngl from 'ngl';

import mounted from '../../utils/mounted';
import { BASE_PATH } from '../../utils/constants';

import style from './style.module.css';
import useNGLFile from '../../hooks/use-ngl-file';

const changeOpacity = throttle((representation, membraneOpacity) => {
  representation.setParameters({ opacity: membraneOpacity });
  // optimise render or not depending on opacity level
  if (representation.visible && !membraneOpacity) {
    representation.setVisibility(false);
  }
  if (!representation.visible && membraneOpacity) {
    representation.setVisibility(true);
  }
}, 100);

export const NGLViewer = memo(
  forwardRef(
    (
      {
        accession,
        className,
        playing,
        spinning,
        membraneOpacity,
        smooth,
        onProgress,
        ...props
      },
      ref,
    ) => {
      const containerRef = useRef(null);
      const stageRef = useRef(null);

      const { loading: loadingPDB, file: pdbFile } = useNGLFile(
        `${BASE_PATH}${accession}/files/md.imaged.rot.dry.pdb`,
        { defaultRepresentation: false, ext: 'pdb' },
      );
      const { loading: loadingDCD, file: dcdFile } = useNGLFile(
        `${BASE_PATH}${accession}/files/md.traj.50.dcd`,
        { ext: 'dcd' },
      );

      // Stage creation and removal on mounting and unmounting
      useEffect(() => {
        const stage = new ngl.Stage(containerRef.current);
        stageRef.current = stage;
        return () => stageRef.current.dispose();
      }, []);

      // frames
      const handleFrameChange = useCallback(frame => {
        if (!onProgress) return;
        const progress = clamp(
          frame /
            (stageRef.current.compList[0].trajList[0].trajectory.numframes - 1),
          0,
          1,
        );
        onProgress(progress);
      }, []);

      // Resize logic
      // declare handler
      const handleResize = useCallback(
        debounce(() => {
          if (!stageRef.current) return;
          const canvas = containerRef.current.querySelector('canvas');
          if (canvas) canvas.style.height = '';
          stageRef.current.handleResize();
        }, 500),
        [],
      );
      // connect to events
      useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
          handleResize.cancel();
          window.removeEventListener('resize', handleResize);
        };
      }, []);

      // PDB file, base structure
      useEffect(
        () => {
          if (!pdbFile) return;
          const structureComponent = stageRef.current.addComponentFromObject(
            pdbFile,
          );

          structureComponent.autoView();

          // main structure
          structureComponent.addRepresentation('cartoon', {
            sele: 'not(hetero or water or ion)',
            name: 'structure',
          });
          // membrane
          structureComponent.addRepresentation('licorice', {
            sele: '(not polymer or hetero) and not (water or ion)',
            opacity: 0.5,
            name: 'membrane',
          });
        },
        [pdbFile],
      );

      // DCD file, trajectory
      useEffect(
        () => {
          if (!(pdbFile && dcdFile)) return;
          const frames = stageRef.current.compList[0].addTrajectory(dcdFile);
          frames.signals.frameChanged.add(handleFrameChange);
          if (playing) frames.trajectory.player.play();
          window.frames = frames;
          return () => {
            frames.signals.frameChanged.remove(handleFrameChange);
          };
        },
        [pdbFile, dcdFile],
      );

      // play/pause
      useEffect(
        () => {
          if (!(pdbFile && dcdFile)) return;
          stageRef.current.compList[0].trajList[0].trajectory.player[
            playing ? 'play' : 'pause'
          ]();
        },
        [playing],
      );

      // spinning
      useEffect(
        () => {
          if (spinning === stageRef.current.spinAnimation.paused) {
            stageRef.current.toggleSpin();
          }
        },
        [spinning],
      );

      // membrane opacity
      useEffect(
        () => {
          if (!pdbFile) return;
          changeOpacity(
            stageRef.current.compList[0].reprList.find(
              ({ name }) => name === 'membrane',
            ).repr,
            membraneOpacity,
          );
        },
        [pdbFile, membraneOpacity],
      );
      useEffect(() => changeOpacity.cancel, []);

      // smoothing, player interpolation
      useEffect(
        () => {
          if (!(pdbFile && dcdFile)) return;
          stageRef.current.compList[0].trajList[0].trajectory.player.interpolateType = smooth
            ? 'linear'
            : '';
        },
        [pdbFile, dcdFile, smooth],
      );

      // Expose public getters/setters
      useImperativeMethods(ref, () => ({
        get currentFrame() {
          if (!(pdbFile && dcdFile)) return -1;
          try {
            return stageRef.current.compList[0].trajList[0].trajectory
              .currentFrame;
          } catch (_) {
            return -1;
          }
        },
        set currentFrame(value) {
          if (!(pdbFile && dcdFile)) return;
          try {
            const total = this.totalFrames;
            let frame = value % total;
            if (frame < 0) frame = total - 1;
            stageRef.current.compList[0].trajList[0].trajectory.setFrame(frame);
          } catch (_) {
            /* */
          }
        },
        get totalFrames() {
          if (!(pdbFile && dcdFile)) return 1;
          try {
            return stageRef.current.compList[0].trajList[0].trajectory.frames
              .length;
          } catch (_) {
            return 1;
          }
        },
      }));

      return (
        <div
          ref={containerRef}
          className={cn(className, style.container, {
            [style.loading]: loadingPDB || loadingDCD,
          })}
          data-loading={
            loadingPDB || loadingDCD
              ? `Loading ${loadingPDB ? 'structure' : 'trajectory'}…`
              : undefined
          }
        />
      );
    },
  ),
);
