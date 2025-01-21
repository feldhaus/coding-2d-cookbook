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
  circle1.rect(-50, -50, 100, 100);
  circle1.fill(color.pink);
  circle1.stroke({ width: 2, color: color.pink });
  circle1.position.set(center.x - 200, center.y);

  const circle2 = new PIXI.Graphics();
  app.stage.addChild(circle2);
  circle2.rect(-50, -50, 100, 100);
  circle2.fill(color.pink);
  circle2.stroke({ width: 2, color: color.pink });
  circle2.position.copyFrom(center);

  const circle3 = new PIXI.Graphics();
  app.stage.addChild(circle3);
  circle3.rect(-50, -50, 100, 100);
  circle3.fill(color.pink);
  circle3.stroke({ width: 2, color: color.pink });
  circle3.position.set(center.x + 200, center.y);

  // input - controls
  let { spring, damp, velocity } = window.parent.controlsData;
  let displacement = 0;

  window.addEventListener('message', (event) => {
    if (event.data.type !== 'sliderchange') return;

    displacement = 0;
    velocity = window.parent.controlsData['velocity'];

    switch (event.data.key) {
      case 'spring':
        spring = event.data.value;
        break;
      case 'damp':
        damp = event.data.value;
        break;
    }
  });

  // runs an update loop
  app.ticker.add(({ elapsedMS, deltaTime }) => {
    const force = -spring * displacement - damp * velocity;
    velocity += force * elapsedMS * 0.001;
    displacement += velocity * elapsedMS * 0.001;

    circle1.y = center.y + displacement * 100;
    circle2.angle = displacement * 45;
    circle3.scale.set(1 + displacement, 1 - displacement);
  });
})();
