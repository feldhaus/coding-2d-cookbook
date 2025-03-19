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
  const gravity = 0.8;
  const jumpLimit = 2; // double jump
  const jumpMaxForce = 9;
  const playerRadius = 20;

  // input - controls
  const controlsData = Object.assign({}, window.parent.controlsData);
  window.addEventListener('message', (event) => {
    const { type, key, value } = event.data;
    if (type !== 'sliderinput') return;
    controlsData[key] = value;

    if (key === 'radius') {
      circle1.clear();
      circle1.circle(0, 0, value);
      circle1.fill({ color: color.white });
    }
  });

  // add graphics
  const circle1 = new PIXI.Graphics();
  app.stage.addChild(circle1);
  circle1.circle(0, 0, controlsData.radius);
  circle1.fill({ color: color.white });
  circle1.position.copyFrom(center);

  const circle2 = new PIXI.Graphics();
  app.stage.addChild(circle2);
  circle2.circle(0, 0, playerRadius);
  circle2.fill({ color: color.pink });

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', jump);

  // runs an update loop
  let currentRadians = 0;
  let jumps = 0;
  let jumpOffset = 0;
  let jumpForce = 0;
  app.ticker.add(({ deltaTime }) => {
    // is jumping?
    if (jumps > 0) {
      jumpOffset += jumpForce;
      jumpForce -= gravity * deltaTime;
      if (jumpOffset < 0) {
        jumpOffset = 0;
        jumpForce = 0;
        jumps = 0;
      }
    }

    const { radius, speed } = controlsData;

    // update circle2 position
    const distanceFromCenter = radius + playerRadius + jumpOffset;
    currentRadians += speed * deltaTime;
    const translatePoint = pointTranslate(
      center,
      currentRadians,
      distanceFromCenter,
    );
    circle2.position.copyFrom(translatePoint);
  });

  function jump() {
    if (jumps < jumpLimit) {
      jumps++;
      jumpForce = jumpMaxForce;
    }
  }

  // translates a point by an angle in radians and distance
  function pointTranslate(point, angle, distance) {
    return FVector.add(point, FVector.mult(FVector.fromAngle(angle), distance));
  }
})();
