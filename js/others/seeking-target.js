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
  const maxSpeed = 5;
  const maxForce = 0.2;
  const pointer = { x: center.x, y: center.y };

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    pointer.x = event.data.global.x;
    pointer.y = event.data.global.y;
  });

  // runs an update loop
  app.ticker.add(({ deltaTime }) => {
    seek();
    update(deltaTime);
    vehicle.rotation = Math.atan2(velocity.y, velocity.x);
  });

  const vehicle = new PIXI.Graphics();
  app.stage.addChild(vehicle);
  vehicle.position.copyFrom(center);
  vehicle.poly([10, 0, -10, -8, -6, 0, -10, 8]);
  vehicle.fill(color.pink);

  let velocity = new PIXI.Point();
  let acceleration = new PIXI.Point();

  function seek() {
    // a desired point from the position to the target
    let desired = FVector.sub(pointer, vehicle);

    // scale to maximum speed
    desired = FVector.mult(FVector.normalize(desired), maxSpeed);

    // steering = desired minus velocity
    let steer = FVector.sub(desired, velocity);

    // limit to maximum steering force
    steer = limit(steer, maxForce);
    acceleration.x += steer.x;
    acceleration.y += steer.y;
  }

  function update(deltaTime) {
    // update velocity
    velocity.x += acceleration.x;
    velocity.y += acceleration.y;

    // limit speed
    velocity = limit(velocity, maxSpeed);
    vehicle.x += velocity.x * deltaTime;
    vehicle.y += velocity.y * deltaTime;

    // reset accelerationelertion to 0 each cycle
    acceleration.x = 0;
    acceleration.y = 0;
  }

  function limit(vector, max) {
    if (FVector.magSqr(vector) > max * max) {
      return FVector.mult(FVector.normalize(vector), max);
    }
    return vector;
  }
})();
