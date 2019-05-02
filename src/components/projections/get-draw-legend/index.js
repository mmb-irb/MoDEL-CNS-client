export default context => (data, xScale, yScale, width, height) => {
  const imgData = context.createImageData(data.length, 1);
  // create a 32 bytes view on image data
  const uInt32View = new Uint32Array(imgData.data.buffer);

  data.forEach(({ x, y, fill: { r, g, b } }, i) => {
    let opacity = 255;
    if (xScale) {
      const onScreenX = xScale(x);
      if (onScreenX < 0 || onScreenX > width) {
        opacity = 100;
      } else {
        const onScreenY = yScale(y);
        if (onScreenY < 0 || onScreenY > height) opacity = 100;
      }
    }

    // fill r, g, b, and opacity in one go
    uInt32View[i] = opacity * 0x1000000 + b * 0x10000 + g * 0x100 + r;
  });

  context.putImageData(imgData, 0, 0);
};
