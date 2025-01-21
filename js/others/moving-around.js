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
  const handling = 0.07;
  const radius = 15;

  // add graphics
  const vehicle = new PIXI.Graphics();
  app.stage.addChild(vehicle);
  vehicle.position.set(400, 300);
  vehicle.circle(0, 0, radius);
  vehicle.fill({ color: color.pink });
  vehicle.direction = new PIXI.Point();

  const compass = new PIXI.Graphics();
  app.stage.addChild(compass);
  compass.position.set(400, 300);
  compass.poly([5, 0, 0, -5, 0, 5]);
  compass.fill({ color: color.white });

  // listen to key events
  document.onkeydown = (event) => {
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
      vehicle.direction.x = -1;
    } else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
      vehicle.direction.x = 1;
    }
    if (event.code === 'KeyS' || event.code === 'ArrowDown') {
      vehicle.direction.y = -1;
    } else if (event.code === 'KeyW' || event.code === 'ArrowUp') {
      vehicle.direction.y = 1;
    }
    event.preventDefault();
  };

  document.onkeyup = (event) => {
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
      vehicle.direction.x = 0;
    } else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
      vehicle.direction.x = 0;
    }
    if (event.code === 'KeyS' || event.code === 'ArrowDown') {
      vehicle.direction.y = 0;
    } else if (event.code === 'KeyW' || event.code === 'ArrowUp') {
      vehicle.direction.y = 0;
    }
    event.preventDefault();
  };

  // runs an update loop
  app.ticker.add(({ deltaTime }) => {
    vehicle.rotation += handling * vehicle.direction.x * deltaTime;
    vehicle.x += vehicle.direction.y * Math.cos(vehicle.rotation) * deltaTime;
    vehicle.y += vehicle.direction.y * Math.sin(vehicle.rotation) * deltaTime;
    vehicle.x = clamp(vehicle.x, radius, 800 - radius);
    vehicle.y = clamp(vehicle.y, radius, 600 - radius);

    compass.rotation += (vehicle.rotation - compass.rotation) * 0.1;
    compass.position = pointTranslate(
      vehicle.position,
      compass.rotation,
      radius + 5,
    );
  });

  // restrict a value to a given range
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // translates a point by an angle in radians and distance
  function pointTranslate(point, angle, distance) {
    return new PIXI.Point(
      point.x + distance * Math.cos(angle),
      point.y + distance * Math.sin(angle),
    );
  }
})();
