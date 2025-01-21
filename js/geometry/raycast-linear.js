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

  let mapCoords = [];
  fetch('./assets/json/de_aztec.json')
    .then((res) => res.json())
    .then((data) => drawMap(data));

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  function drawMap(data) {
    mapCoords = data.coords;
    for (let i = 0; i < mapCoords.length; i++) {
      graphics.poly(mapCoords[i]);
    }
    graphics.stroke({ width: 1, color: color.white });
    graphics.fill({ color: color.white, alpha: 0.05 });
  }

  const player = new PIXI.Sprite({ texture: PIXI.Texture.WHITE });
  app.stage.addChild(player);
  player.tint = color.pink;
  player.scale.set(20, 20);
  player.anchor.set(0.5, 0.5);
  player.position.set(50, 300);
  player.direction = new PIXI.Point(0, 0);

  const feedback = new PIXI.Graphics();
  app.stage.addChild(feedback);

  // listen to pointer and key events
  let pointer = { x: 0, y: 0 };
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    pointer = event.data.global;
  });

  document.onkeydown = function (event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      player.direction.x = -1;
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      player.direction.x = 1;
    }

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      player.direction.y = -1;
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      player.direction.y = 1;
    }

    event.preventDefault();
  };

  document.onkeyup = function (event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      player.direction.x = 0;
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      player.direction.x = 0;
    }

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      player.direction.y = 0;
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      player.direction.y = 0;
    }

    event.preventDefault();
  };

  // runs an update loop
  app.ticker.add(({ deltaTime }) => {
    player.x += player.direction.x * 1.5 * deltaTime;
    player.y += player.direction.y * 1.5 * deltaTime;
    raycastLinear();
  });

  function raycastLinear() {
    // find closest intersection
    const closestIntersect = findClosestIntersection(player.position, pointer);

    feedback.clear();

    // there is an intersect
    if (closestIntersect != null) {
      feedback.circle(closestIntersect.x, closestIntersect.y, 3);
      feedback.moveTo(player.x, player.y);
      feedback.lineTo(closestIntersect.x, closestIntersect.y);
      feedback.stroke({ width: 2, color: color.pink });
    }
  }

  // returns a closest intersection
  function findClosestIntersection(origin, direction) {
    let closestIntersect = null;

    const ray = { a: origin, b: direction };

    // see intersection between all the map segments
    for (let i = 0; i < mapCoords.length; i++) {
      for (let j = 0; j < mapCoords[i].length - 2; j += 2) {
        const seg = {
          a: new PIXI.Point(mapCoords[i][j + 0], mapCoords[i][j + 1]),
          b: new PIXI.Point(mapCoords[i][j + 2], mapCoords[i][j + 3]),
        };

        // get intersection
        const intersection = getIntersection(ray, seg);

        // there is not intersection, continue
        if (!intersection) {
          continue;
        }

        // it's nearest, save it
        if (
          !closestIntersect ||
          intersection.distance < closestIntersect.distance
        ) {
          closestIntersect = intersection;
        }
      }
    }

    return closestIntersect;
  }

  // returns an intersect between raycast and a segment
  function getIntersection(ray, seg) {
    const u = new PIXI.Point(ray.b.x - ray.a.x, ray.b.y - ray.a.y);
    const v = new PIXI.Point(seg.b.x - seg.a.x, seg.b.y - seg.a.y);
    const w = new PIXI.Point(ray.a.x - seg.a.x, ray.a.y - seg.a.y);
    const s = new PIXI.Point(seg.a.x - ray.a.x, seg.a.y - ray.a.y);

    const d1 = (u.x * s.y + u.y * w.x) / (v.x * u.y - v.y * u.x);
    const d2 = (seg.a.x + v.x * d1 - ray.a.x) / u.x;

    // must be within parametic whatevers for ray / segment
    if (d1 < 0 || d1 > 1) return;
    if (d2 < 0) return;

    // return the point of intersection
    return {
      x: ray.a.x + u.x * d2,
      y: ray.a.y + u.y * d2,
      distance: d2,
    };
  }
})();
