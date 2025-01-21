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

  const circle1 = createCircle();
  app.stage.addChild(circle1);
  circle1.position.set(100, 500);

  const circle2 = createCircle();
  app.stage.addChild(circle2);
  circle2.position.set(200, 200);

  const circle3 = createCircle();
  app.stage.addChild(circle3);
  circle3.position.set(600, 100);

  const circle4 = createCircle();
  app.stage.addChild(circle4);
  circle4.position.set(700, 450);

  const walker = new PIXI.Graphics();
  app.stage.addChild(walker);
  walker.circle(0, 0, 20);
  walker.stroke({ width: 5, color: color.pink });

  function createCircle() {
    const g = new PIXI.Graphics();
    g.circle(0, 0, 50);
    g.fill({ color: color.pink, alpha: 0.05 });
    g.circle(0, 0, 5);
    g.fill({ color: color.pink });
    g.eventMode = 'dynamic';
    g.cursor = 'pointer';
    g.offset = new PIXI.Point();
    return g;
  }

  // listen to pointer events
  let dragging = null;
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    if (dragging === null) return;

    dragging.position.set(
      event.data.global.x - dragging.offset.x,
      event.data.global.y - dragging.offset.y,
    );

    draw();
  });

  [circle1, circle2, circle3, circle4].forEach((item) => {
    item.on('pointerdown', (event) => {
      dragging = item;
      item.alpha = 0.5;
      item.offset.set(
        event.data.global.x - item.x,
        event.data.global.y - item.y,
      );
    });
    item.on('pointerup', () => {
      dragging = null;
      item.alpha = 1;
    });
    item.on('pointerupoutside', () => {
      dragging = null;
      item.alpha = 1;
    });
  });

  function draw() {
    graphics.clear();

    // line between dots
    graphics.moveTo(circle1.x, circle1.y);
    graphics.lineTo(circle2.x, circle2.y);
    graphics.lineTo(circle3.x, circle3.y);
    graphics.lineTo(circle4.x, circle4.y);
    graphics.stroke({ width: 2, color: color.white });

    // draw path
    for (let i = 0; i < path; i++) {
      const position = cubicBezier(
        circle1,
        circle2,
        circle3,
        circle4,
        i / path,
      );
      graphics.circle(position.x, position.y, 2);
    }
    graphics.fill({ color: color.pink });
  }
  draw();

  // runs an update loop
  let elapsedTime = 0;
  app.ticker.add(({ elapsedMS }) => {
    elapsedTime += elapsedMS;
    const threshold = (elapsedTime % duration) / duration;
    walker.position = cubicBezier(
      circle1,
      circle2,
      circle3,
      circle4,
      threshold,
    );
  });

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
