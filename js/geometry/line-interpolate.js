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
  const duration = 2000;

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  const circle1 = createCircle();
  app.stage.addChild(circle1);
  circle1.position.set(100, 500);

  const circle2 = createCircle();
  app.stage.addChild(circle2);
  circle2.position.set(700, 100);

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
  });

  [circle1, circle2].forEach((item) => {
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

  // runs an update loop
  let elapsedTime = 0;
  app.ticker.add(({ elapsedMS }) => {
    elapsedTime += elapsedMS;
    draw((elapsedTime % duration) / duration);
  });

  function draw(threshold) {
    graphics.clear();
    graphics.moveTo(circle1.x, circle1.y);
    graphics.lineTo(circle2.x, circle2.y);
    graphics.stroke({ width: 2, color: color.white });
    const interpolation = lineInterpolate(circle1, circle2, threshold);
    graphics.circle(interpolation.x, interpolation.y, 5);
    graphics.fill({ color: color.white });
  }

  // returns the interpolation from start to end along the a segment
  function lineInterpolate(p0, p1, threshold) {
    const angle = FVector.angleBetween(p0, p1);
    const distance = FVector.distanceBetween(p0, p1) * threshold;
    return FVector.add(p0, FVector.mult(FVector.fromAngle(angle), distance));
  }
})();
