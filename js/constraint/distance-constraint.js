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

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  const cursor = new PIXI.Point();
  cursor.copyFrom(center);

  const ball = new PIXI.Point();
  ball.copyFrom(center);

  const distanceConstraint = 80;
  const ballRadius = 20;

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    cursor.copyFrom(event.data.global);
    ball.copyFrom(
      constrainDistance(ball, event.data.global, distanceConstraint),
    );
    draw();
  });

  function draw() {
    graphics.clear();

    graphics.circle(cursor.x, cursor.y, distanceConstraint);
    graphics.fill({ color: color.pink, alpha: 0.05 });
    graphics.stroke({ width: 1, color: color.pink });

    graphics.circle(ball.x, ball.y, ballRadius);
    graphics.fill({ color: color.pink });
  }

  function constrainDistance(point, anchor, distance) {
    if (FVector.distanceBetween(point, anchor) <= distance) return point;

    const vector = FVector.sub(point, anchor);
    return FVector.add(
      FVector.mult(FVector.normalize(vector), distance),
      anchor,
    );
  }
})();
