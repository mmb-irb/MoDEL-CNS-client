import React, { useLayoutEffect, useRef, forwardRef } from 'react';
import { Card } from '@material-ui/core';

import style from './style.module.css';

const KEYFRAMES = {
  opacity: [0, 1],
  transform: ['translateY(50px)', 'translateY(0)'],
};

const ANIMATION_OPTIONS = {
  fill: 'both',
  easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  duration: 500,
};

const AnimatedCard = forwardRef(({ overrideComponent, ...props }, ref) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const node = containerRef.current && containerRef.current.firstElementChild;
    if (!(node && node.animate)) return;

    const index = Array.from(
      document.querySelectorAll('main section'),
    ).findIndex(section => node === section);

    const animation = node.animate(KEYFRAMES, {
      ...ANIMATION_OPTIONS,
      delay: index * 150,
    });

    return () => animation.cancel();
  }, []);

  const Component = overrideComponent ? 'section' : Card;

  return (
    <div ref={containerRef} className={style.container}>
      <Component component="section" {...props} ref={ref} />
    </div>
  );
});

export default AnimatedCard;
