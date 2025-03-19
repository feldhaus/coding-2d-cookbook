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
  const width = 300;
  const height = 100;
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);
  graphics.position.copyFrom(center);

  // runs an update loop
  let angle = 0;
  app.ticker.add(({ deltaTime }) => {
    graphics.clear();

    const direction = FVector.fromAngle(angle);

    const x1 = -halfWidth * direction.x - -halfHeight * direction.y;
    const y1 = -halfWidth * direction.y + -halfHeight * direction.x;
    const x2 = +halfWidth * direction.x - -halfHeight * direction.y;
    const y2 = +halfWidth * direction.y + -halfHeight * direction.x;
    const x3 = +halfWidth * direction.x - +halfHeight * direction.y;
    const y3 = +halfWidth * direction.y + +halfHeight * direction.x;
    const x4 = -halfWidth * direction.x - +halfHeight * direction.y;
    const y4 = -halfWidth * direction.y + +halfHeight * direction.x;

    const l = Math.min(x1, x2, x3, x4);
    const r = Math.max(x1, x2, x3, x4);
    const t = Math.min(y1, y2, y3, y4);
    const b = Math.max(y1, y2, y3, y4);

    graphics.poly([l, t, r, t, r, b, l, b]);
    graphics.stroke({ width: 1, color: color.white });

    graphics.poly([x1, y1, x2, y2, x3, y3, x4, y4]);
    graphics.fill({ color: color.pink });

    angle += 0.01 * deltaTime;
  });
})();
