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
  const surfaceLength = 400;

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  const circle1 = createCircle();
  app.stage.addChild(circle1);
  circle1.position.set(center.x - 200, center.y);

  const circle2 = createCircle();
  app.stage.addChild(circle2);
  circle2.position.set(center.x - 150, center.y - 200);

  function createCircle() {
    const g = new PIXI.Graphics();
    g.circle(0, 0, 50);
    g.fill({ color: color.pink, alpha: 0.05 });
    g.circle(0, 0, 5);
    g.fill(color.pink);
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

    const angle = FVector.angleBetween(center, dragging.position);
    const translatePoint = pointTranslate(center, angle, surfaceLength * 0.5);
    dragging.position.copyFrom(translatePoint);
    draw();
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

  function draw() {
    graphics.clear();

    // get all required values to draw
    const incidenceAngle = FVector.angleBetween(circle2, center);
    const incidenceLength = FVector.distanceBetween(circle2, center);
    const surfaceAngle = FVector.angleBetween(circle1, center);
    const surfacePoint = pointTranslate(circle1, surfaceAngle, surfaceLength);
    const reflectAngle = angleReflect(incidenceAngle, surfaceAngle);
    const reflectPoint = pointTranslate(center, reflectAngle, incidenceLength);

    // draw incidence and surface lines
    graphics.moveTo(circle1.x, circle1.y);
    graphics.lineTo(surfacePoint.x, surfacePoint.y);
    graphics.moveTo(circle2.x, circle2.y);
    graphics.lineTo(center.x, center.y);
    graphics.stroke({ width: 2, color: color.white });

    // draw reflect line
    graphics.lineTo(reflectPoint.x, reflectPoint.y);
    graphics.stroke({ width: 2, color: color.pink });
  }
  draw();

  // translates a point by an angle in radians and distance
  function pointTranslate(point, angle, distance) {
    return FVector.add(point, FVector.mult(FVector.fromAngle(angle), distance));
  }

  // returns the angle of reflection
  function angleReflect(incidenceAngle, surfaceAngle) {
    return surfaceAngle * 2 - incidenceAngle;
  }
})();
