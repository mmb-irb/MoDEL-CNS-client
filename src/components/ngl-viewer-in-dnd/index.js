import React, { lazy, Suspense, useRef, useEffect, memo } from 'react';

import { Rnd } from 'react-rnd';

import Card from '../animated-card';

import style from './style.module.css';

const NGLViewerWithControls = lazy(() =>
  import(
    /* webpackChunkName: 'ngl-viewer-with-controls' */ '../ngl-viewer-with-controls'
  ),
);

const MIN_NGL_DIMENSION = 150;

// This component render a small NGL viewer
// It is called when user clicks in a point in the projections component
// Also it is called by the generic analysis page
const NGLViewerInDND = memo(
  ({
    // The following arguments are only available when the components is called from...
    accession, // Both
    hovered, // Generic analysis page
    analysis, // Generic analysis page
    selected, // Generic analysis page
    setSelected, // Generic analysis page
    requestedFrame, // Projections
    setRequestedFrame, // Projections
  }) => {
    const nglViewRef = useRef(null);
    const rndRef = useRef(null);

    useEffect(() => {
      const MARGIN = 25;
      const { innerWidth, innerHeight, scrollY } = window;
      const dimension = Math.max(
        Math.min(innerWidth / 4, innerHeight / 4),
        MIN_NGL_DIMENSION,
      );
      rndRef.current.updateSize({
        width: dimension,
        height: 1.5 * dimension,
      });
      rndRef.current.updatePosition({
        x: innerWidth - dimension - MARGIN,
        y: innerHeight - 1.5 * dimension - MARGIN + scrollY,
      });
    }, []);

    return (
      <Rnd
        className={style.rnd}
        data-rnd
        bounds="body"
        cancel="canvas, [data-popover]"
        onResize={() => nglViewRef.current && nglViewRef.current.autoResize()}
        onResizeStop={() => {
          if (!nglViewRef.current) return;
          nglViewRef.current.autoResize();
          nglViewRef.current.autoResize.flush();
        }}
        ref={rndRef}
      >
        <Card className={style['floating-card']} elevation={4}>
          <Suspense fallback={null}>
            <NGLViewerWithControls
              accession={accession}
              hovered={hovered}
              selected={selected}
              ref={nglViewRef}
              className={style['ngl-viewer-with-controls']}
              startsPlaying={false}
              noTrajectory={!analysis || analysis !== 'fluctuation'}
              requestedFrame={
                Number.isFinite(requestedFrame)
                  ? requestedFrame
                  : !analysis || (analysis !== 'fluctuation' && selected)
              }
              close={() => {
                (setRequestedFrame || setSelected)(null);
                if (setSelected)
                  // Check if setSelected is available
                  setSelected(analysis === 'fluctuation' ? new Set() : null);
              }}
            />
          </Suspense>
        </Card>
      </Rnd>
    );
  },
);

export default NGLViewerInDND;
