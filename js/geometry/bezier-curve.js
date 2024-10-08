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
  const duration = 1000;
  const path = 50;

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  // runs an update loop
  let elapsedTime = 0;
  app.ticker.add(update);

  // create and add interactive dots
  const dot1 = createDot();
  app.stage.addChild(dot1);
  dot1.position.set(100, 500);

  const dot2 = createDot();
  app.stage.addChild(dot2);
  dot2.position.set(200, 200);

  const dot3 = createDot();
  app.stage.addChild(dot3);
  dot3.position.set(600, 100);

  const dot4 = createDot();
  app.stage.addChild(dot4);
  dot4.position.set(700, 450);

  // circle that will walk along the path
  const walker = new PIXI.Graphics();
  app.stage.addChild(walker);
  walker.circle(0, 0, 20);
  walker.stroke({ width: 5, color: color.pink });

  function createDot() {
    const g = new PIXI.Graphics();
    g.circle(0, 0, 50);
    g.fill({ color: color.pink, alpha: 0.05 });
    g.circle(0, 0, 5);
    g.fill({ color: color.pink });
    g.eventMode = 'static';
    g.cursor = 'pointer';
    g.offset = new PIXI.Point();
    // listeners
    g.on('pointerdown', (event) => {
      g.alpha = 0.5;
      g.offset.set(event.data.global.x - g.x, event.data.global.y - g.y);
    });
    g.on('pointerup', () => {
      g.alpha = 1;
    });
    g.on('pointerupoutside', () => {
      g.alpha = 1;
    });
    g.on('pointermove', (event) => {
      if (g.alpha === 1) return;
      g.position.set(
        event.data.global.x - g.offset.x,
        event.data.global.y - g.offset.y,
      );
      draw();
    });
    return g;
  }

  function draw() {
    graphics.clear();

    // line between dots
    graphics.moveTo(dot1.x, dot1.y);
    graphics.lineTo(dot2.x, dot2.y);
    graphics.lineTo(dot3.x, dot3.y);
    graphics.lineTo(dot4.x, dot4.y);
    graphics.stroke({ width: 2, color: color.white });

    // draw path
    for (let i = 0; i < path; i++) {
      const position = cubicBezier(dot1, dot2, dot3, dot4, i / path);
      graphics.circle(position.x, position.y, 2);
    }
    graphics.fill({ color: color.pink });
  }
  draw();

  function update({ elapsedMS }) {
    elapsedTime += elapsedMS;
    const threshold = (elapsedTime % duration) / duration;
    walker.position = cubicBezier(dot1, dot2, dot3, dot4, threshold);
  }

  // a Cubic Bezier curve is defined by four points p0, p1, p2, and p3
  function cubicBezier(p0, p1, p2, p3, threshold) {
    const t = threshold;
    const ti = 1 - threshold;
    // prettier-ignore
    return new PIXI.Point(
    ti**3*p0.x + 3*ti**2*t*p1.x + 3*ti*t**2*p2.x + t**3*p3.x,
    ti**3*p0.y + 3*ti**2*t*p1.y + 3*ti*t**2*p2.y + t**3*p3.y
  );
  }
})();
