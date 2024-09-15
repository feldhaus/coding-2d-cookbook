(async () => {
  // create application
  const app = new PIXI.Application();
  await app.init({
    backgroundColor: 0x21252f,
    antialias: true,
    width: 800,
    height: 600,
  });
  document.body.appendChild(app.canvas);

  // constants
  const color = { pink: 0xec407a, white: 0xf2f5ea };
  const width = app.renderer.width;
  const height = app.renderer.height;
  const minSize = Math.min(width, height);

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  carpet(minSize, 4, (width - minSize) / 2, (height - minSize) / 2);

  function carpet(size, level, x0, y0) {
    if (level === 0) return;
    level--;

    const newSize = size / 3;

    graphics.rect(newSize + x0, newSize + y0, newSize, newSize);
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (!(x === 1 && y === 1)) {
          carpet(newSize, level, x0 + x * newSize, y0 + y * newSize);
        }
      }
    }

    if (level % 2 === 0) {
      graphics.stroke({ width: 2, color: color.white });
    } else {
      graphics.stroke({ width: 2, color: color.pink });
    }
  }
})();
