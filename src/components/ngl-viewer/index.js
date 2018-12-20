import React, {
  PureComponent,
  forwardRef,
  useRef,
  useImperativeMethods,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { debounce } from 'lodash-es';
import cn from 'classnames';
import * as ngl from 'ngl';

import mounted from '../../utils/mounted';
import { BASE_PATH } from '../../utils/constants';

import style from './style.module.css';
import useNGLFile from '../../hooks/use-ngl-file';

export const NGLViewer = forwardRef(
  ({ accession, className, playing, ...props }, ref) => {
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
        if (playing) frames.trajectory.player.play();
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

    // Expose public methods and getters/setters
    useImperativeMethods(ref, () => ({
      centerFocus() {
        console.log('centering focus');
      },
      toggleSpin() {
        console.log('toggling spin');
      },
      toggleSmooth(on) {
        console.log('toggling smooth');
      },
      goToStatic() {
        console.log('going to static view');
      },
      get currentFrame() {
        // console.log('getting current frame');
        return '';
      },
      set currentFrame(value) {
        // console.log('setting current frame');
      },
      get totalFrames() {
        // console.log('getting total frame number');
        return '';
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
);

class _NGLViewer extends PureComponent {
  state = { loadingTrajectory: true };
  #ref = React.createRef();
  #stage;
  #trajectory;

  #handleResize = debounce(async () => {
    if (this.#stage && this.#ref.current) {
      const canvas = this.#ref.current.querySelector('canvas');
      // need to unset this first when we reduce the size (fullscreen off)
      if (canvas) canvas.style.height = '';
      this.#stage.handleResize();
    }
  }, 500);

  #handleFrameChange = frame => {
    if (this.#stage && this.props.onProgress) {
      this.props.onProgress(
        (frame + 1) /
          (this.#stage.compList[0].trajList[0].trajectory.numframes - 1),
      );
    }
  };

  centerFocus = (() => {
    // also used as flag for first time run
    let originalOrientation = null;
    return () => {
      if (this.#stage.compList[0]) {
        if (originalOrientation) {
          // every other time
          this.#stage.animationControls.orient(originalOrientation, 500);
        } else {
          // only the first time
          this.#stage.compList[0].autoView();
          originalOrientation = this.#stage.viewerControls.getOrientation();
        }
      }
    };
  })();

  toggleSpin = () => {
    if (this.#stage) {
      this.#stage.toggleSpin();
    }
  };

  toggleSmooth = on => {
    if (this.#stage) {
      this.#stage.compList[0].trajList[0].trajectory.player.interpolateType = on
        ? 'linear'
        : '';
    }
  };

  goToStatic = () => {
    if (this.#stage.compList[0].trajList[0]) {
      this.#stage.compList[0].trajList[0].trajectory.setFrame(-1);
    }
  };

  get currentFrame() {
    if (this.#stage.compList[0].trajList[0])
      return this.#stage.compList[0].trajList[0].trajectory.currentFrame;
    return null;
  }

  set currentFrame(value) {
    if (this.#stage.compList[0].trajList[0]) {
      const totalFrames = this.totalFrames;
      let nextFrame = value % totalFrames;
      if (nextFrame < 0) nextFrame = totalFrames - nextFrame;
      if (this.props.onProgress) {
        this.props.onProgress((nextFrame + 1) / (totalFrames - 1));
      }
      this.#stage.compList[0].trajList[0].trajectory.setFrame(nextFrame);
    }
  }

  get totalFrames() {
    if (this.#stage.compList[0].trajList[0])
      return this.#stage.compList[0].trajList[0].trajectory.frames.length;
    return null;
  }

  render() {
    return (
      <div
        ref={this.#ref}
        className={cn(this.props.className, style.container, {
          [style['loading-trajectory']]: this.state.loadingTrajectory,
        })}
      />
    );
  }

  async componentDidMount() {
    mounted.add(this);
    // connect resize event to logic to update the stage
    //   (disconnect in componentWillUnmount)
    window.addEventListener('resize', this.#handleResize);
    // create NGL Stage
    this.#stage = new ngl.Stage(this.#ref.current);

    // add PDB data
    const structureComponent = this.#stage.addComponentFromObject(
      this.props.pdbFile,
    );
    // default representation
    // this.#stage.defaultFileRepresentation(structureComponent);
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
    // make sure the view is centered
    this.centerFocus();
    // load frames
    const frames = await ngl.autoLoad(
      BASE_PATH + this.props.accession + '/md.traj.50.dcd',
      { ext: 'dcd' },
    );

    this.setState({ loadingTrajectory: false });

    structureComponent.addTrajectory(this.props.dcdFile);

    this.#stage.compList[0].trajList[0].trajectory.signals.frameChanged.add(
      this.#handleFrameChange,
    );

    this.#handleChanges(undefined, this.props);
  }

  #handleChanges = (prevProps = {}, props) => {
    if (prevProps.isFullscreen !== props.isFullscreen) {
      this.#handleResize();
    }

    if (prevProps.playing !== props.playing) {
      this.#stage.compList[0].trajList[0].trajectory.player[
        props.playing ? 'play' : 'pause'
      ]();
    }

    if (prevProps.membraneOpacity !== props.membraneOpacity) {
      const representation = this.#stage.compList[0].reprList.find(
        ({ name }) => name === 'membrane',
      ).repr;
      representation.setParameters({ opacity: props.membraneOpacity });
      // optimise render or not depending on opacity level
      if (!prevProps.membraneOpacity) {
        representation.setVisibility(true);
      }
      if (!props.membraneOpacity) {
        representation.setVisibility(false);
      }
    }
  };

  componentDidUpdate(prevProps) {
    this.#handleChanges(prevProps, this.props);
  }

  componentWillUnmount() {
    mounted.delete(this);
    // remove event listeners
    if (this.#stage.compList[0].trajList[0]) {
      this.#stage.compList[0].trajList[0].trajectory.signals.frameChanged.remove(
        this.#handleFrameChange,
      );
    }
    this.#handleResize.cancel();
    window.removeEventListener('resize', this.#handleResize);
  }
}

export default ({ accession, className, ...props }) => {
  const { loading: loadingPDB, file: pdbFile } = useNGLFile(
    `${BASE_PATH}${accession}/files/md.imaged.rot.dry.pdb`,
    { defaultRepresentation: false, ext: 'pdb' },
  );
  const { loading: loadingDCD, file: dcdFile } = useNGLFile(
    `${BASE_PATH}${accession}/files/md.traj.50.dcd`,
    { ext: 'dcd' },
  );

  const [stage, setStage] = useState(null);

  const ref = useRef(null);

  if (!stage && ref.current) {
    const newStage = new ngl.Stage(ref.current);
    console.log(newStage);
    setStage(newStage);
  }

  if (stage && !stage.compList.length && pdbFile) {
    const structureComponent = stage.addComponentFromObject(pdbFile);

    structureComponent.autoView();

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
  }

  if (
    stage &&
    stage.compList[0] &&
    !stage.compList[0].trajList.length &&
    dcdFile
  ) {
    const frames = stage.compList[0].addTrajectory(dcdFile);
    frames.trajectory.player.play();
  }

  // if (!(pdbFile && dcdFile)) return 'Loading';

  // return (
  //   <NGLViewer accession={accession} pdbFile={pdbFile} dcdFile={dcdFile} />
  // );
  return (
    <div
      ref={ref}
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
};
