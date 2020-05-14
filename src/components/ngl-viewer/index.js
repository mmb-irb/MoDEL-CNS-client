import React, {
  forwardRef,
  memo,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { debounce, clamp } from 'lodash-es';
import cn from 'classnames';
import { Stage, ColormakerRegistry, Matrix4 } from 'ngl';

import { frame } from 'timing-functions';

import payloadToNGLFile from './payload-to-ngl-file';
import getFrames from './get-frames';

import { AccessionCtx, ProjectCtx, PdbCtx } from '../../contexts';

import style from './style.module.css';

// To get frames
import { BASE_PATH_PROJECTS } from '../../utils/constants';
import extractCounts from './extract-counts';
import useNGLFile from '../../hooks/use-ngl-file';
import axios from 'axios';

const DEFAULT_NUMBER_OF_FRAMES = 25;
const DEFAULT_ORIENTATION_TRANSITION_DURATION = 500; // 500 ms

const CHAIN_SELECTION = 'polymer and not hydrogen ';

const NGLViewer = memo(
  forwardRef(({ // URL to find the structure data in the API
    // If no URL is provided then use the context pdbData (the 'md.imaged.rot.dry.pdb' file)
    structureURL, trajectoryURL, className, playing, spinning, smooth, onProgress, noTrajectory, projection, framesSelect, nFrames = DEFAULT_NUMBER_OF_FRAMES, hovered, selected, requestedFrame, darkBackground, perspective, speed, drawingMethods, coloringMethods, opacities, chains }, ref) => { // If no URL is provided then use the main trajectory (the 'md.imaged.rot.xtc' file) // URL to find the trajectory data in the API
    // True when we just want to display a static structure // Requeste number of frames to display
    // data from context
    const accession = useContext(AccessionCtx);
    const { metadata, curatedOrientation } = useContext(ProjectCtx);

    // references
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const firstTime = useRef(true);
    // curatedOrientation might be null
    const originalOritentationRef = useRef(
      curatedOrientation ? new Matrix4().set(...curatedOrientation) : null,
    );

    // in-view hook
    const [inViewRef, isInView] = useInView();

    // Load the structure data
    // If a structureURL is provided, download data form the API
    // Otherwise, use the context pdbData (i.e. the 'md.imaged.rot.dry.pdb' file )
    const pdbData = structureURL
      ? useNGLFile(structureURL, { defaultRepresentation: false, ext: 'pdb' })
      : useContext(PdbCtx);

    const { loading: loadingPDB, file: pdbFile } = pdbData;

    const isProjection = Number.isFinite(projection);

    // Set variable to store trajectory data and loading status
    const trajectoryRef = useRef({});

    // Hook for the trajectory data (frames)
    useEffect(
      () => {
        // Do not load anything if the 'noTrajectory' parameter is passed
        if (noTrajectory) return;
        // Set the url to ask the API
        let url = trajectoryURL
          ? trajectoryURL
          : `${BASE_PATH_PROJECTS}${accession}/files/trajectory`;

        // Save the number of frames asked when the load starts
        const askedFrames = nFrames;

        // Get the frames to be loaded in a standarized string format for the API
        let frames;
        if (framesSelect)
          frames = getFrames(
            isProjection,
            metadata,
            noTrajectory,
            askedFrames,
            requestedFrame,
          );

        // Add the frame selection
        if (frames) url = url + `?frames=${frames}`;

        /*
          const url = `${BASE_PATH_PROJECTS}${accession}/files/trajectory${
            isProjection ? `.pca-${projection + 1}.bin` : ''
            // Frames are included only when there is no projection (i.e. it is not a pca analysis)
          }${Boolean(frames && !isProjection) ? `?frames=${frames}` : ''}`;
          // Here, if you ask for the trajectory.bin instead of just trajectory, you get the whole file
          // This is because the only route of the API accepting frames selection is the "trajectory" endpoint
          // Other paths such as "trajectory.bin" will be processed as "/:files"
          */

        // Set the loading status as true
        trajectoryRef.current.loading = true;

        // Ask the API through axios (https://www.npmjs.com/package/axios)
        // Some extra load features are passed through axios
        // Set a cancel 'token'
        const source = axios.CancelToken.source();
        let didCancel = false;
        trajectoryRef.current.progress = 0;
        // Set a function to track the download progress
        const onDownloadProgress = progressEvent => {
          // Check if progress is measurable. If so, mesure it.
          if (progressEvent.lengthComputable)
            trajectoryRef.current.progress =
              progressEvent.loaded / progressEvent.total;
        };

        // Send a request to the API in a Promise/await manner
        axios(url, {
          cancelToken: source.token,
          onDownloadProgress,
          responseType: 'arraybuffer',
        })
          // If the request has succeed
          .then(response => {
            if (didCancel) return;
            // 'counts' include the number of atoms and the real number of frames
            trajectoryRef.current.counts = extractCounts(response);
            // Save inside the ref
            trajectoryRef.current.askedFrames = parseInt(askedFrames);
            trajectoryRef.current.payload = response.data;
            trajectoryRef.current.loading = false;
          })
          // Otherwise
          .catch(error => {
            if (didCancel) return;
            console.error('Error while loading the trajectory: ' + error);
          });

        return () => {
          // Cancel the request
          source.cancel();
          didCancel = true;
        };
      },
      // Dependencies
      [
        trajectoryURL,
        projection,
        isProjection,
        metadata,
        noTrajectory,
        framesSelect,
        nFrames,
        requestedFrame,
        accession,
      ],
    );

    const trajectoryLoadingStatus = trajectoryRef.current.loading;
    const trajectoryPayload = trajectoryRef.current.payload;
    const trajectoryProgress = trajectoryRef.current.progress;
    const trajectoryFrames = trajectoryRef.current.askedFrames;
    const trajectoryAtoms = trajectoryRef.current.counts
      ? trajectoryRef.current.counts.atoms
      : undefined;

    // Stage creation and removal on mounting and unmounting
    useEffect(() => {
      // set-up
      stageRef.current = new Stage(containerRef.current);
      // wait for a render to screen, then
      frame().then(() => {
        if (!stageRef.current) return;
        // make sure NGL knows the size it has available
        stageRef.current.handleResize();
      });
      // clean-up
      return () => {
        // NOTE: following line causes to fail when loading a new viewer with
        // NOTE: previous structure data
        // stageRef.current.removeAllComponents();
        stageRef.current.dispose();
        stageRef.current = null;
      };
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
          await frame(); // async, should check if we still have the viewer
          if (!stageRef.current) return;
          let currentTick = Date.now() - beginning;
          // exit condition from 'while (true)' loop
          // if we've gone over the full time of the animation
          if (currentTick > duration) break;
          if (darkBackground) currentTick = duration - currentTick;
          const color = `#${Math.round((currentTick * 0xff) / duration)
            .toString('16')
            .padStart(2, '0')
            .repeat(3)}`;
          stageRef.current.viewer.setBackground(color);
        }
        await frame(); // async, should check if we still have the viewer
        if (!stageRef.current) return;
        // make sure we're set to the final colour
        // (in case the transition was stopped halfway through)
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
            (stageRef.current.compList[0].trajList[0].trajectory.frameCount -
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
    // connect the handle to events
    useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => {
        handleResize.cancel();
        window.removeEventListener('resize', handleResize);
      };
    }, [handleResize]);

    // PDB file, base structure
    // Set the representations
    useEffect(() => {
      if (!pdbFile) return;
      const structureComponent = stageRef.current.addComponentFromObject(
        pdbFile,
      );

      // set the view somehow, in any case no transition duration is set
      // because it's the first time we do that

      // if an original orientation was aleady defined
      // (manually created, and stored in the API)
      structureComponent.autoView(CHAIN_SELECTION, 0);
      if (originalOritentationRef.current) {
        // use it to set the initial orientation
        stageRef.current.animationControls.orient(
          originalOritentationRef.current,
          0,
        );
      } else {
        originalOritentationRef.current = stageRef.current.viewerControls.getOrientation();
      }

      for (const chain of chains) {
        // Get the current chain array index
        const chainIndex = chains.findIndex(c => c === chain);
        // Get the previous representation of the current chain
        const previousRepresentation = stageRef.current.compList[0].reprList.find(
          rep => rep.name === chain.name,
        );
        // Delete previous representation if exists
        if (previousRepresentation)
          stageRef.current.compList[0].removeRepresentation(
            previousRepresentation,
          );
        // Set a new representation
        if (opacities[chainIndex] !== 0)
          // DANI: Antes esto se hacía con 'structureComponent.addRepresentation'
          stageRef.current.compList[0].addRepresentation(
            drawingMethods[chainIndex],
            {
              sele: chain.selection,
              name: chain.name,
              opacity: opacities[chainIndex],
              colorScheme: coloringMethods[chainIndex],
            },
          );
      }
    }, [
      pdbFile,
      isProjection,
      chains,
      drawingMethods,
      // We make eslint keep quiet or it complains about using spread syntax in the dependencies
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...drawingMethods,
      coloringMethods,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...coloringMethods,
      opacities,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ...opacities,
    ]);

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
            atomsNumber => pdbFile.atomStore.residueIndex[atomsNumber - 1] + 1,
          ),
        ),
      ).join(' or ');
      stageRef.current.compList[0].addRepresentation('ball+stick', {
        sele: seleContext,
        name: nameContext,
      });
    }, [pdbFile, hovered, selected]);

    // pause on loading
    // Make the NGL static while loading after user changes the frame number
    useEffect(() => {
      if (!(pdbFile && stageRef.current.compList[0].trajList[0])) return;
      stageRef.current.compList[0].trajList[0].trajectory.player.pause();
    }, [pdbFile, trajectoryLoadingStatus]);

    // DCD file, trajectory
    // Once the trajectory is loaded, introduce it into the representation
    useEffect(() => {
      const file = payloadToNGLFile(
        pdbFile,
        trajectoryPayload,
        trajectoryAtoms,
        trajectoryFrames,
        isProjection,
        Number.isFinite(requestedFrame),
      );

      if (!file) return;

      if (stageRef.current.compList[0]) {
        stageRef.current.compList[0].autoView(CHAIN_SELECTION, 0);
      }

      const component = stageRef.current.compList[0];
      // remove all possibly already existing trajectories
      // This return an error in console (may be a bug) but it is actually working
      // See https://github.com/arose/ngl/issues/680
      component.trajList.forEach(component.removeTrajectory.bind(component));

      const frames = component.addTrajectory(file);
      frames.signals.frameChanged.add(handleFrameChange);
      frames.trajectory.setFrame(0);

      component.autoView(CHAIN_SELECTION, 0);
      originalOritentationRef.current = stageRef.current.viewerControls.getOrientation();

      return () => frames.signals.frameChanged.remove(handleFrameChange);
    }, [
      requestedFrame,
      pdbFile,
      trajectoryPayload,
      trajectoryAtoms,
      trajectoryFrames,
      handleFrameChange,
      isProjection,
    ]);

    // play/pause
    useEffect(() => {
      if (!(pdbFile && trajectoryPayload)) return;
      const { player } = stageRef.current.compList[0].trajList[0].trajectory;
      player[playing && isInView ? 'play' : 'pause']();
      return () => player.pause();
    }, [pdbFile, trajectoryPayload, playing, isInView]);

    // speed
    useEffect(() => {
      stageRef.current &&
        stageRef.current.compList[0] &&
        stageRef.current.compList[0].trajList[0] &&
        stageRef.current.compList[0].trajList[0].trajectory.player.setParameters(
          { timeout: 500 / (Math.log2(speed + 1) + 1) },
        );
    }, [speed, trajectoryLoadingStatus]);

    // spinning
    useEffect(() => {
      if (
        stageRef.current &&
        stageRef.current.spinAnimation &&
        spinning === stageRef.current.spinAnimation.paused
      ) {
        stageRef.current.toggleSpin();
      }
    }, [spinning]);

    // smoothing, player interpolation
    useEffect(() => {
      if (!(pdbFile && trajectoryPayload)) return;
      stageRef.current.compList[0].trajList[0].trajectory.player.parameters.interpolateType = smooth
        ? 'linear'
        : '';
    }, [pdbFile, trajectoryPayload, smooth]);

    // to avoid sometimes when it's not rendering after loading
    useEffect(() => {
      if (!(pdbFile && trajectoryPayload)) return;
      handleResize();
      return handleResize.cancel;
    }, [pdbFile, trajectoryPayload, handleResize]);

    // listen to change event from nightingale component
    useEffect(() => {
      const handler = ({ detail }) => {
        // escape case for event listener
        if (
          !detail ||
          !(detail.eventtype === 'click' || detail.eventtype === 'reset')
        ) {
          return;
        }
        let offset = 0;
        let highlight = '';
        const addOffsetMappingFn = item => +item + offset;
        for (const manager of document.querySelectorAll('protvista-manager')) {
          // get highlight value for each manager
          const thisHiglight = manager.attributeValues.get('highlight');
          const nextOffset = offset + +manager.dataset.chainLength;
          if (!thisHiglight) {
            // if none, escape
            offset = nextOffset;
            continue;
          }
          const [start, end] = thisHiglight.split(':').map(addOffsetMappingFn);
          highlight += ` or ${start}-${end}`;
          offset = nextOffset;
        }
        highlight = highlight.substr(4); // remove initial ' or '

        const structureComponent = stageRef.current.compList[0];

        const previousStructureRepresentation =
          structureComponent &&
          structureComponent.reprList.find(
            representation => representation.name === 'structure',
          );
        if (previousStructureRepresentation) {
          structureComponent.removeRepresentation(
            previousStructureRepresentation,
          );
        }
        // no highlight, then default coloring
        if (!highlight) {
          structureComponent.addRepresentation('cartoon', {
            sele: CHAIN_SELECTION,
            name: 'structure',
            opacity: 1,
          });
          stageRef.current.animationControls.orient(
            originalOritentationRef.current,
            DEFAULT_ORIENTATION_TRANSITION_DURATION,
          );
          return;
        }

        // otherwise, highlight accordingly
        const colorSchemeID = ColormakerRegistry.addSelectionScheme(
          [['yellow', highlight], ['white', '*']],
          'custom label',
        );
        structureComponent.addRepresentation('cartoon', {
          sele: CHAIN_SELECTION,
          name: 'structure',
          opacity: 1,
          color: colorSchemeID,
        });
        structureComponent.autoView(
          highlight,
          DEFAULT_ORIENTATION_TRANSITION_DURATION,
        );
      };
      window.addEventListener('change', handler);
      return () => window.removeEventListener('change', handler);
    }, []);

    // Expose public methods and getters/setters
    useImperativeHandle(
      ref,
      () => ({
        autoResize: handleResize,
        centerFocus() {
          if (!originalOritentationRef.current) return;
          stageRef.current.animationControls.orient(
            originalOritentationRef.current,
            DEFAULT_ORIENTATION_TRANSITION_DURATION,
          );
        },
        get currentFrame() {
          if (!(pdbFile && trajectoryPayload)) return -1;
          try {
            return stageRef.current.compList[0].trajList[0].trajectory
              .currentFrame;
          } catch (_) {
            return -1;
          }
        },
        set currentFrame(value) {
          if (!(pdbFile && trajectoryPayload)) return;
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
          if (!(pdbFile && trajectoryPayload)) return 1;
          try {
            return stageRef.current.compList[0].trajList[0].trajectory.frames
              .length;
          } catch (_) {
            return 1;
          }
        },
      }),
      [pdbFile, trajectoryPayload, handleResize],
    );

    // workaround to have multiple ref logic on one element
    // https://github.com/thebuilder/react-intersection-observer/issues/186#issuecomment-468641525
    const handleRef = node => {
      inViewRef(node);
      containerRef.current = node;
    };

    // Finally, render the ngl window
    return (
      <div
        ref={handleRef}
        className={cn(className, style.container, {
          [style['loading-pdb']]: loadingPDB,
          [style['loading-trajectory']]:
            !noTrajectory && trajectoryLoadingStatus,
          [style['light-theme']]: !darkBackground,
        })}
        // Display loading status data in the upper left corner of the NGL window
        data-loading={
          loadingPDB
            ? `Loading structure`
            : !pdbFile
            ? `No structure available`
            : trajectoryLoadingStatus
            ? `Loading ${
                loadingPDB
                  ? 'structure'
                  : `trajectory (${Math.round(trajectoryProgress * 100)}%)`
              }…`
            : !trajectoryPayload && !noTrajectory
            ? `No trajectory available`
            : // Show nothing when everything was finished and fine
              undefined
        }
      />
    );
  }),
);

export default NGLViewer;
