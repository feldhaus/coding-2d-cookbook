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
  const center = new PIXI.Point(
    app.renderer.width * 0.5,
    app.renderer.height * 0.5,
  );
  const rate = 1 / (app.ticker.FPS * 5); // 5 seconds

  // input - controls
  const controlsData = Object.assign({}, window.parent.controlsData);
  controlsData.amplitude *= FMath.DEG2RAD;
  window.addEventListener('message', (event) => {
    const { type, key, value } = event.data;
    if (type !== 'sliderchange') return;

    if (key === 'amplitude') {
      controlsData[key] = value * FMath.DEG2RAD;
    } else {
      controlsData[key] = value;
    }
  });

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);
  graphics.rect(-100, -100, 200, 200);
  graphics.stroke({ width: 2, color: color.pink });
  graphics.position.copyFrom(center);

  // runs an update loop
  let threshold = 0;
  app.ticker.add(({ deltaTime }) => {
    threshold = (threshold + deltaTime * rate) % 1;
    const { amplitude, frequency } = controlsData;
    graphics.rotation =
      amplitude *
      Math.sin(threshold * Math.PI * frequency) *
      Math.max(0, 0.8 - threshold);
  });
})();
