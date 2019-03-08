import React, {
  forwardRef,
  memo,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { debounce, throttle, clamp } from 'lodash-es';
import cn from 'classnames';
import { Stage } from 'ngl';

import { AccessionCtx, ProjectCtx, PdbCtx } from '../../contexts';

import useFrames from '../../hooks/use-frames';

import style from './style.module.css';

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

const COORDINATES_NUMBER = 3;
const DEFAULT_NUMBER_OF_FRAMES = 25;

const NGLViewer = memo(
  forwardRef(
    (
      {
        className,
        playing,
        spinning,
        membraneOpacity,
        smooth,
        onProgress,
        noTrajectory,
        nFrames = DEFAULT_NUMBER_OF_FRAMES,
        hovered,
        selected,
        requestedFrame,
      },
      ref,
    ) => {
      // data from context
      const accession = useContext(AccessionCtx);
      const { metadata } = useContext(ProjectCtx);
      const pdbData = useContext(PdbCtx);

      // references
      const containerRef = useRef(null);
      const stageRef = useRef(null);
      const originalOritentationRef = useRef(null);

      const { loading: loadingPDB, file: pdbFile } = pdbData;

      // default, no frames loaded
      let frames = [];
      // multiple frames loaded, as a trajectory
      if (metadata && !noTrajectory) {
        const frameStep = Math.floor(metadata.frameCount / nFrames);
        frames = Array.from({ length: nFrames }).map((_, i) => i * frameStep);
        // only one specific frame loaded
      } else if (metadata && noTrajectory && Number.isFinite(requestedFrame)) {
        frames = [requestedFrame];
      }

      const {
        loading: loadingDCD,
        frameData: dcdPayload,
        progress: dcdProgress,
      } = useFrames(accession, frames, pdbData.file && pdbData.file.atomCount);

      // Stage creation and removal on mounting and unmounting
      useEffect(() => {
        const stage = new Stage(containerRef.current);
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
      useEffect(() => {
        if (!pdbFile) return;
        const structureComponent = stageRef.current.addComponentFromObject(
          pdbFile,
        );

        structureComponent.autoView();
        originalOritentationRef.current = stageRef.current.viewerControls.getOrientation();

        // main structure
        structureComponent.addRepresentation('cartoon', {
          sele: 'polymer',
          name: 'structure',
        });
        // membrane
        structureComponent.addRepresentation('licorice', {
          sele: '(not polymer or hetero) and not (water or ion)',
          opacity: 0.5,
          name: 'membrane',
        });
      }, [pdbFile]);

      // highlight hovered atoms from other components
      useEffect(() => {
        if (!pdbFile || !(selected instanceof Set) || !(hovered || selected)) {
          return;
        }

        const nameHighlight = 'highlighted';
        const previousHighlightRepresentation = stageRef.current.compList[0].reprList.find(
          representation => representation.name === nameHighlight,
        );
        if (previousHighlightRepresentation) {
          stageRef.current.compList[0].removeRepresentation(
            previousHighlightRepresentation,
          );
        }

        const nameContext = 'context';
        const previousContextRepresentation = stageRef.current.compList[0].reprList.find(
          representation => representation.name === nameContext,
        );
        if (previousContextRepresentation) {
          stageRef.current.compList[0].removeRepresentation(
            previousContextRepresentation,
          );
        }

        let selectedPlusMaybeHovered;
        if (hovered) {
          selectedPlusMaybeHovered = new Set(selected);
          selectedPlusMaybeHovered.add(hovered);
        } else {
          selectedPlusMaybeHovered = selected;
        }

        const atoms = Array.from(selectedPlusMaybeHovered);
        if (!atoms.length) return;

        // ngl starts counting at 0
        const seleHighlight = `@${atoms
          .map(atomNumber => atomNumber - 1)
          .join(',')}`;
        stageRef.current.compList[0].addRepresentation('spacefill', {
          sele: seleHighlight,
          opacity: 0.5,
          scale: 1.5,
          name: nameHighlight,
        });

        const seleContext = Array.from(
          new Set(
            atoms.map(
              atomsNumber =>
                pdbFile.atomStore.residueIndex[atomsNumber - 1] + 1,
            ),
          ),
        ).join(' or ');
        stageRef.current.compList[0].addRepresentation('ball+stick', {
          sele: seleContext,
          name: nameContext,
        });
      }, [pdbFile, hovered, selected]);

      // pause on loading
      useEffect(() => {
        if (!(pdbFile && stageRef.current.compList[0].trajList[0])) return;
        stageRef.current.compList[0].trajList[0].trajectory.player.pause();
      }, [pdbFile, loadingDCD]);

      // DCD file, trajectory
      useEffect(() => {
        if (!(pdbFile && dcdPayload)) return;
        const view = new Float32Array(dcdPayload);
        window.view = view;
        const file = {
          boxes: [],
          type: 'Frames',
          coordinates: Array.from({
            length: Number.isFinite(requestedFrame) ? 1 : nFrames,
          }).map((_, i) =>
            view.subarray(
              i * pdbFile.atomCount * COORDINATES_NUMBER,
              (i + 1) * pdbFile.atomCount * COORDINATES_NUMBER,
            ),
          ),
        };

        const component = stageRef.current.compList[0];

        component.trajList.forEach(component.removeTrajectory.bind(component));

        const frames = component.addTrajectory(file);
        frames.signals.frameChanged.add(handleFrameChange);
        frames.trajectory.setFrame(0);
        if (playing) frames.trajectory.player.play();
        return () => {
          frames.signals.frameChanged.remove(handleFrameChange);
        };
      }, [requestedFrame, pdbFile, dcdPayload]);

      // play/pause
      useEffect(() => {
        if (!(pdbFile && dcdPayload)) return;
        stageRef.current.compList[0].trajList[0].trajectory.player[
          playing ? 'play' : 'pause'
        ]();
      }, [playing]);

      // spinning
      useEffect(() => {
        if (spinning === stageRef.current.spinAnimation.paused) {
          stageRef.current.toggleSpin();
        }
      }, [spinning]);

      // membrane opacity
      useEffect(() => {
        if (!pdbFile) return;
        changeOpacity(
          stageRef.current.compList[0].reprList.find(
            ({ name }) => name === 'membrane',
          ).repr,
          membraneOpacity,
        );
      }, [pdbFile, membraneOpacity]);
      useEffect(() => changeOpacity.cancel, []);

      // smoothing, player interpolation
      useEffect(() => {
        if (!(pdbFile && dcdPayload)) return;
        stageRef.current.compList[0].trajList[0].trajectory.player.interpolateType = smooth
          ? 'linear'
          : '';
      }, [pdbFile, dcdPayload, smooth]);

      // to avoid sometimes when it's not rendering after loading
      useEffect(() => {
        handleResize();
        return handleResize.cancel;
      }, [pdbFile, dcdPayload]);

      // Expose public methods and getters/setters
      useImperativeHandle(
        ref,
        () => ({
          autoResize: handleResize,
          centerFocus() {
            if (!originalOritentationRef.current) return;
            stageRef.current.animationControls.orient(
              originalOritentationRef.current,
              500,
            );
          },
          get currentFrame() {
            if (!(pdbFile && dcdPayload)) return -1;
            try {
              return stageRef.current.compList[0].trajList[0].trajectory
                .currentFrame;
            } catch (_) {
              return -1;
            }
          },
          set currentFrame(value) {
            if (!(pdbFile && dcdPayload)) return;
            try {
              const total = this.totalFrames;
              let frame = value % total;
              if (frame < 0) frame = total - 1;
              stageRef.current.compList[0].trajList[0].trajectory.setFrame(
                frame,
              );
            } catch (_) {
              /* */
            }
          },
          get totalFrames() {
            if (!(pdbFile && dcdPayload)) return 1;
            try {
              return stageRef.current.compList[0].trajList[0].trajectory.frames
                .length;
            } catch (_) {
              return 1;
            }
          },
        }),
        [pdbFile, dcdPayload],
      );
      return (
        <div
          ref={containerRef}
          className={cn(className, style.container, {
            [style['loading-pdb']]: loadingPDB,
            [style['loading-trajectory']]: !noTrajectory && loadingDCD,
          })}
          data-loading={
            loadingPDB || (!noTrajectory && loadingDCD)
              ? `Loading ${
                  loadingPDB
                    ? 'structure'
                    : `trajectory (${Math.round(dcdProgress * 100)}%)`
                }…`
              : undefined
          }
        />
      );
    },
  ),
);

export default NGLViewer;
