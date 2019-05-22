import { createCanvas } from 'canvas';
import { interpolate } from 'd3';

import movePoints from '.';
import { sleep } from 'timing-functions';

const width = 200;
const height = 200;

const dataPoints = [
  {
    interpolateX: interpolate(0, 50),
    interpolateY: interpolate(0, 50),
    fill: { hex: '#00aaff' },
    duration: 10,
    delay: 5,
  },
  {
    interpolateX: interpolate(0, 75),
    interpolateY: interpolate(0, 75),
    fill: { hex: '#ffaa00' },
    duration: 10,
    delay: 0,
  },
  {
    interpolateX: interpolate(0, 275),
    interpolateY: interpolate(0, 100),
    fill: { hex: '#aaff00' },
    duration: 15,
    delay: 0,
  },
  {
    interpolateX: interpolate(0, 175),
    interpolateY: interpolate(0, 300),
    fill: { hex: '#aaff00' },
    duration: 5,
    delay: 10,
  },
];
dataPoints.interpolateRadius = interpolate(0, 5);

describe('movePoints', () => {
  let canvas;
  let context;

  beforeEach(() => {
    canvas = createCanvas(width, height);
    context = canvas.getContext('2d');
  });

  it('should render to canvas for first time', async () => {
    await movePoints({
      context,
      dataPoints,
      width,
      height,
      maxTime: 50,
      isFirstTime: true,
    });

    expect(canvas.createPNGStream()).toMatchImageSnapshot();
  });
  it('should render to canvas not for first time', async () => {
    await movePoints({
      context,
      dataPoints,
      width,
      height,
      maxTime: 50,
      isFirstTime: false,
    });

    expect(canvas.createPNGStream()).toMatchImageSnapshot();
  });
  it('should render to canvas, interrupt, and rerender', async () => {
    // don't await
    movePoints({
      context,
      dataPoints,
      width,
      height,
      maxTime: 50,
      isFirstTime: false,
    });
    // sleep a bit (less than previous max time)
    await sleep(1);
    // ask to rerender
    await movePoints({
      context,
      dataPoints,
      width,
      height,
      maxTime: 50,
      isFirstTime: false,
    });

    expect(canvas.createPNGStream()).toMatchImageSnapshot();
  });
});
