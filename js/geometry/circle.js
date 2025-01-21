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
  const tau = Math.PI * 2; // alias for two pi
  const radius = 150;

  // input - controls
  const controlsData = Object.assign({}, window.parent.controlsData);
  window.addEventListener('message', (event) => {
    const { type, key, value } = event.data;
    if (type !== 'sliderinput') return;
    controlsData[key] = value;
    updateMainCircle({ x: 0, y: 0 });
  });

  // add graphics
  const circle = new PIXI.Graphics();
  app.stage.addChild(circle);
  circle.position.copyFrom(center);

  const circle1 = new PIXI.Graphics();
  app.stage.addChild(circle1);
  circle1.position.set(100, app.renderer.height - 100);

  const circle2 = new PIXI.Graphics();
  app.stage.addChild(circle2);
  circle2.position.set(app.renderer.width - 100, 100);

  addText(
    '0, 2π',
    { x: circle.x + radius + 10, y: circle.y },
    { x: 0.0, y: 0.5 },
  );
  addText(
    'π / 2',
    { x: circle.x, y: circle.y + radius + 10 },
    { x: 0.5, y: 0.0 },
  );
  addText('π', { x: circle.x - radius - 10, y: circle.y }, { x: 1.0, y: 0.5 });
  addText(
    '3π / 2',
    { x: circle.x, y: circle.y - radius - 10 },
    { x: 0.5, y: 1.0 },
  );

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    updateMainCircle(event.data.global);
  });

  // runs an update loop
  let elapsedTime = 0;
  app.ticker.add(({ deltaTime }) => {
    updateRunningCircle(circle1, 50, 1, 0.1);
    updateRunningCircle(circle2, 30, -1, 0.3);
    elapsedTime += deltaTime;
  });

  updateMainCircle({ x: 0, y: 0 });

  function addText(text, position, anchor) {
    const tip = new PIXI.Text({
      text,
      style: { fontSize: 24, fill: color.pink },
      resolution: window.devicePixelRatio,
    });
    app.stage.addChild(tip);
    tip.anchor.set(anchor.x, anchor.y);
    tip.position.set(position.x, position.y);
  }

  function updateMainCircle(position) {
    let angle = Math.atan2(position.y - circle.y, position.x - circle.x);
    let hypot = Math.hypot(position.x - circle.x, position.y - circle.y);
    if (angle < 0) {
      angle += tau;
    }

    const { slices } = controlsData;
    const sliceCirc = tau / slices;
    const sliceIndex = angle / sliceCirc;

    circle.clear();

    for (let i = 0; i < slices; i++) {
      circle.moveTo(0, 0);
      circle.arc(0, 0, radius, sliceCirc * i, sliceCirc * (i + 1));
      circle.lineTo(0, 0);
      if (sliceIndex > i && radius > hypot) {
        circle.fill({ color: color.white, alpha: 0.2 });
      }
      circle.stroke({ width: 3, color: color.white });
    }
  }

  function updateRunningCircle(shape, radius, direction, speed) {
    const circum = elapsedTime * speed;
    const invert = Math.floor(circum / tau) % 2 === 0;

    shape.clear();
    if (invert) {
      shape.arc(0, 0, radius, 0, (circum % tau) * direction);
    } else {
      shape.arc(0, 0, radius, (circum % tau) * direction, 0);
    }
    shape.stroke({ width: 20, color: color.white });
  }
})();
