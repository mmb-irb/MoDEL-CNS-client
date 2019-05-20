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
import { frame } from 'timing-functions';

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
        projection,
        nFrames = DEFAULT_NUMBER_OF_FRAMES,
        hovered,
        selected,
        requestedFrame,
        darkBackground,
        perspective,
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
      const firstTime = useRef(true);

      const { loading: loadingPDB, file: pdbFile } = pdbData;

      // default, no frames loaded
      let frames = [];
      if (Number.isFinite(projection)) {
        frames = Array.from({ length: 20 }, (_, i) => i);
        // multiple frames loaded, as a trajectory
      } else if (metadata && !noTrajectory) {
        const frameStep = Math.floor(metadata.frameCount / nFrames);
        frames = Array.from({ length: nFrames }, (_, i) => i * frameStep);
        // only one specific frame loaded
      } else if (metadata && noTrajectory && Number.isFinite(requestedFrame)) {
        frames = [requestedFrame];
      }

      const {
        loading: loadingDCD,
        frameData: dcdPayload,
        progress: dcdProgress,
        counts,
      } = useFrames(accession, frames, projection);

      // Stage creation and removal on mounting and unmounting
      useEffect(() => {
        // set-up
        stageRef.current = new Stage(containerRef.current);
        frame().then(() => {
          if (!stageRef.current) return;
          stageRef.current.handleResize();
          stageRef.current.autoView();
        });
        // clean-up
        return () => stageRef.current.dispose();
      }, []);

      // background (with transition)
      useEffect(() => {
        const beginning = Date.now();
        let duration = 1000;
        if (firstTime.current) {
          duration = 0;
          firstTime.current = false;
        }
        (async () => {
          while (true) {
            await frame();
            let currentTick = Date.now() - beginning;
            // exit condition from while true loop
            if (currentTick > duration) break;
            if (darkBackground) currentTick = duration - currentTick;
            const color = `#${Math.round((currentTick * 0xff) / duration)
              .toString('16')
              .padStart(2, '0')
              .repeat(3)}`;
            stageRef.current.viewer.setBackground(color);
          }
          await frame();
          stageRef.current.viewer.setBackground(
            darkBackground ? 'black' : 'white',
          );
        })();
        // set duration to 0 to cancel possibly ongoing loop
        return () => (duration = 0);
      }, [darkBackground]);

      // perspective
      useEffect(() => {
        stageRef.current &&
          stageRef.current.viewer &&
          stageRef.current.viewer.setCamera &&
          stageRef.current.viewer.setCamera(
            perspective ? 'perspective' : 'orthographic',
          );
      }, [perspective]);

      // frames
      const handleFrameChange = useCallback(
        frame => {
          if (!onProgress) return;
          const progress = clamp(
            frame /
              (stageRef.current.compList[0].trajList[0].trajectory.numframes -
                1),
            0,
            1,
          );
          onProgress(progress);
        },
        [onProgress],
      );

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
      }, [handleResize]);

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
          sele: 'polymer and not hydrogen',
          name: 'structure',
        });
        // membrane
        const membraneRepresentation = structureComponent.addRepresentation(
          'licorice',
          {
            sele: '(not polymer or hetero) and not (water or ion)',
            opacity: 0.5,
            name: 'membrane',
          },
        );
        if (Number.isFinite(projection)) {
          membraneRepresentation.setVisibility(false);
        }
      }, [pdbFile, projection]);

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
        const file = {
          boxes: [],
          type: 'Frames',
          coordinates: [],
        };
        let length = nFrames;
        if (Number.isFinite(projection)) {
          length = 20;
        } else if (Number.isFinite(requestedFrame)) {
          length = 1;
        }
        for (let i = 0; i < length; i++) {
          const coordinates = new Float32Array(
            pdbFile.atomCount * COORDINATES_NUMBER,
          );
          let k = 0;
          if (Number.isFinite(projection)) {
            // if it is a PCA projection
            for (let j = 0; j < pdbFile.atomCount; j++) {
              if (k < counts.atoms && pdbFile.getAtomProxy(j).element !== 'H') {
                // getting value from trajectory
                coordinates[j * COORDINATES_NUMBER] =
                  view[
                    i * counts.atoms * COORDINATES_NUMBER +
                      k * COORDINATES_NUMBER
                  ];
                coordinates[j * COORDINATES_NUMBER + 1] =
                  view[
                    i * counts.atoms * COORDINATES_NUMBER +
                      k * COORDINATES_NUMBER +
                      1
                  ];
                coordinates[j * COORDINATES_NUMBER + 2] =
                  view[
                    i * counts.atoms * COORDINATES_NUMBER +
                      k * COORDINATES_NUMBER +
                      2
                  ];
                k++;
              }
            }
          } else {
            // if it is not a PCA projection
            coordinates.set(
              view.subarray(
                i * counts.atoms * COORDINATES_NUMBER,
                (i + 1) * counts.atoms * COORDINATES_NUMBER,
              ),
            );
          }
          file.coordinates.push(coordinates);
        }

        const component = stageRef.current.compList[0];

        component.trajList.forEach(component.removeTrajectory.bind(component));

        const frames = component.addTrajectory(file);
        frames.signals.frameChanged.add(handleFrameChange);
        frames.trajectory.setFrame(0);

        component.autoView();
        return () => {
          frames.signals.frameChanged.remove(handleFrameChange);
        };
      }, [
        requestedFrame,
        pdbFile,
        dcdPayload,
        handleFrameChange,
        nFrames,
        counts.atoms,
        projection,
      ]);

      // play/pause
      useEffect(() => {
        if (!(pdbFile && dcdPayload)) return;
        stageRef.current.compList[0].trajList[0].trajectory.player[
          playing ? 'play' : 'pause'
        ]();
      }, [pdbFile, dcdPayload, playing]);

      // spinning
      useEffect(() => {
        if (
          stageRef.current &&
          stageRef.current.spinAnimation &&
          stageRef.current.spinAnimation.paused &&
          spinning === stageRef.current.spinAnimation.paused
        ) {
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
      }, [pdbFile, membraneOpacity, projection]);
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
        if (!(pdbFile && dcdPayload)) return;
        handleResize();
        return handleResize.cancel;
      }, [pdbFile, dcdPayload, handleResize]);

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
        [pdbFile, dcdPayload, handleResize],
      );
      return (
        <div
          ref={containerRef}
          className={cn(className, style.container, {
            [style['loading-pdb']]: loadingPDB,
            [style['loading-trajectory']]: !noTrajectory && loadingDCD,
            [style['light-theme']]: !darkBackground,
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
