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
  const circle1 = new PIXI.Graphics();
  app.stage.addChild(circle1);
  circle1.circle(0, 0, 50);
  circle1.fill(color.pink);
  circle1.position.set(center.x - 200, center.y);

  const circle2 = new PIXI.Graphics();
  app.stage.addChild(circle2);
  circle2.circle(0, 0, 50);
  circle2.fill(color.pink);
  circle2.position.copyFrom(center);

  const circle3 = new PIXI.Graphics();
  app.stage.addChild(circle3);
  circle3.circle(0, 0, 50);
  circle3.fill(color.pink);
  circle3.position.set(center.x + 200, center.y);

  // runs an update loop
  let elapsedTime = 0;
  app.ticker.add(({ elapsedMS }) => {
    elapsedTime += elapsedMS;
    circle1.y = center.y + Math.cos(elapsedTime * 0.002) * 100;
    circle2.y = center.y + Math.cos(elapsedTime * 0.004) * 100;
    circle3.y = center.y + Math.cos(elapsedTime * 0.008) * 100;
  });
})();
