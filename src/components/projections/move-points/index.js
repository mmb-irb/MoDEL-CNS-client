import { timer, easeCubicInOut, easeElastic } from 'd3';

// device pixel ratio (for "retina" screens)
const dPR = window.devicePixelRatio || 1;

// easing for start animation (looks like a spring coming out of the centre)
const customElastic = easeElastic.amplitude(1).period(0.5);

// timer instance variable
let t;

export default ({ context, dataPoints, width, height, maxTime, firstTime }) => {
  if (t) t.stop();
  t = timer(elapsed => {
    context.fillStyle = 'rgba(255, 255, 255, 0.25)';
    context.fillRect(0, 0, width * dPR, height * dPR);
    if (elapsed >= maxTime) {
      t.stop();
      context.clearRect(0, 0, width, height);
    }
    for (const dataPoint of dataPoints) {
      const easedProgress = Math.max(
        0,
        (firstTime ? customElastic : easeCubicInOut)(
          Math.min((elapsed - dataPoint.delay) / dataPoint.duration, 1),
        ),
      );
      dataPoint.currentX = dataPoint.interpolateX(easedProgress);
      dataPoint.currentY = dataPoint.interpolateY(easedProgress);
      dataPoint.currentRadius = dataPoint.interpolateRadius(easedProgress);
      // skip out-of-screen points
      if (
        dataPoint.currentX < 0 ||
        dataPoint.currentX > width ||
        dataPoint.currentY < 0 ||
        dataPoint.currentY > height
      ) {
        continue;
      }
      // draw point
      context.fillStyle = dataPoint.fill.hex;
      context.beginPath();
      context.arc(
        dataPoint.currentX,
        dataPoint.currentY,
        dataPoint.currentRadius,
        0,
        2 * Math.PI,
      );
      context.fill();
    }
  });
};
