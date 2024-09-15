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

  let pointer = { x: center.x, y: center.y };
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    pointer = event.data.global;
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
    let desired = new PIXI.Point(pointer.x - vehicle.x, pointer.y - vehicle.y);

    // scale to maximum speed
    desired = normalize(desired);
    desired.x *= maxSpeed;
    desired.y *= maxSpeed;

    // steering = desired minus velocity
    let steer = new PIXI.Point(desired.x - velocity.x, desired.y - velocity.y);

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

  function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  function magnitudeSqr(vector) {
    return vector.x * vector.x + vector.y * vector.y;
  }

  function normalize(vector) {
    let mag = magnitude(vector);
    if (mag > 0) {
      vector.x /= mag;
      vector.y /= mag;
    }
    return vector;
  }

  function limit(vector, max) {
    if (magnitudeSqr(vector) > max * max) {
      vector = normalize(vector);
      vector.x *= max;
      vector.y *= max;
    }
    return vector;
  }
})();
