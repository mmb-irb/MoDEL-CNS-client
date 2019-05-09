import React, { lazy, Suspense, useRef, useEffect } from 'react';

import { Rnd } from 'react-rnd';
import { Card } from '@material-ui/core';

import style from './style.module.css';

const NGLViewerWithControls = lazy(() =>
  import(
    /* webpackChunkName: 'ngl-viewer-with-controls' */ '../ngl-viewer-with-controls'
  ),
);

const MIN_NGL_DIMENSION = 150;

const NGLViewerInDND = ({
  accession,
  hovered,
  analysis,
  selected,
  setSelected,
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
              !analysis || (analysis !== 'fluctuation' && selected)
            }
            close={() =>
              setSelected(analysis === 'fluctuation' ? new Set() : null)
            }
          />
        </Suspense>
      </Card>
    </Rnd>
  );
};

export default NGLViewerInDND;
