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
  const deg2rad = Math.PI / 180;

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);
  graphics.position.copyFrom(center);

  // convert the golden angle to radians
  const goldenAngle = 137.5 * deg2rad;

  // scaling parameter
  const c = 8;

  // is the ordering number of a floret, counting outward from the center
  let n = 0;

  app.ticker.add(() => {
    // is the angle between a reference direction and the position
    // vector of the nth floret in a polar coordinate system originating
    // at the center of the capitulum. It follows that the divergence
    // angle between the position vectors of any two successive florets
    // is constant, α = 137.5◦
    const a = n * goldenAngle;

    // is the distance between the center of the capitulum and the
    // center of the nth floret, given a constant scaling parameter c
    const r = c * Math.sqrt(n);

    // x and y position
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);

    const radius = c - n * 0.005;
    if (radius > 0) {
      // draw a circle
      graphics.circle(x, y, radius);
      graphics.fill({ color: color.white, alpha: (5 + (n % 45)) / 50 });

      // increase n
      n++;
    } else {
      n = 0;
      graphics.clear();
    }
  });
})();
