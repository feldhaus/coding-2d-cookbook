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

  // add shapes
  const shapes = [
    createShape(100, 100, [0, 0, 60, 0, 30, 50]),
    createShape(200, 400, [0, 0, 60, 0, 60, 60, 0, 60]),
    createShape(380, 200, [0, 20, 20, 0, 40, 20, 20, 40]),
    createShape(580, 100, [0, 25, 25, 0, 50, 25, 40, 55, 10, 55]),
    createShape(700, 300, [0, 0, 20, 0, 20, 90, 0, 90]),
    // prettier-ignore
    createShape(500, 380, [0, 0, 50, 0, 50, 90, 0, 90, 0, 70, 40, 70, 40, 20, 0, 20]),
  ];

  function createShape(x, y, path) {
    const shape = new PIXI.Graphics();
    app.stage.addChild(shape);
    shape.position.set(x, y);
    shape.poly(path);
    shape.stroke({ width: 1, color: color.white });
    shape.fill({ color: 0, alpha: 0.01 });
    shape.shapePath = [].concat(path);
    shape.eventMode = 'static';
    shape.cursor = 'pointer';
    shape.dragOffset = new PIXI.Point();
    shape
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove);
    return shape;
  }

  // drag functions
  function onDragStart(event) {
    this.dragging = true;
    const position = event.data.getLocalPosition(this.parent);
    this.dragOffset.set(position.x - this.x, position.y - this.y);
  }

  function onDragEnd(event) {
    this.dragging = false;
  }

  function onDragMove(event) {
    if (!this.dragging) return;
    const position = event.data.getLocalPosition(this.parent);
    this.position.set(
      position.x - this.dragOffset.x,
      position.y - this.dragOffset.y,
    );
    draw();
  }

  function draw() {
    // add viewport limits
    const width = app.renderer.width;
    const height = app.renderer.height;
    const points = [[0, 0, width, 0, width, height, 0, height]];

    // convert shape points to "world" points
    shapes.forEach((shape) => {
      points.push(
        shape.shapePath.map((n, i) => n + (i % 2 === 0 ? shape.x : shape.y)),
      );
    });

    const intersects = raycastToAllPoints(center, points);

    graphics.clear();
    graphics.circle(center.x, center.y, 10);
    graphics.fill({ color: color.pink });

    for (let i = 0; i < intersects.length; i++) {
      graphics.moveTo(center.x, center.y);
      if (i === intersects.length - 1) {
        graphics.lineTo(intersects[i].x, intersects[i].y);
        graphics.lineTo(intersects[0].x, intersects[0].y);
      } else {
        graphics.lineTo(intersects[i].x, intersects[i].y);
        graphics.lineTo(intersects[i + 1].x, intersects[i + 1].y);
      }
      graphics.lineTo(center.x, center.y);
    }
    graphics.fill({ color: color.pink, alpha: 0.05 });
  }
  draw();

  // insert raycasts to unique point
  function raycastToAllPoints(origin, points) {
    // get all angles
    const uniqueAngles = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points[i].length; j += 2) {
        const angle = Math.atan2(
          points[i][j + 1] - origin.y,
          points[i][j] - origin.x,
        );
        uniqueAngles.push(angle - 0.00001, angle + 0.00001);
      }
    }

    // raycast in all directions
    const intersects = [];
    for (let i = 0; i < uniqueAngles.length; i++) {
      const angle = uniqueAngles[i];

      // calculate dx and dy from angle
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const direction = new PIXI.Point(origin.x + dx, origin.y + dy);

      // find closest intersection
      const closestIntersect = findClosestIntersection(
        origin,
        direction,
        points,
      );

      // there is an intersect
      if (closestIntersect != null) {
        closestIntersect.angle = angle;
        intersects.push(closestIntersect);
      }
    }

    // sorting by angles
    intersects.sort(function (a, b) {
      return a.angle - b.angle;
    });

    return intersects;
  }

  // returns a closest intersection
  function findClosestIntersection(origin, direction, points) {
    let closestIntersect = null;

    const ray = { a: origin, b: direction };

    // see intersection between all points
    for (let i = 0; i < points.length; i++) {
      const len = points[i].length;
      for (let j = 0; j < len; j += 2) {
        const seg = {
          a: new PIXI.Point(points[i][j % len], points[i][(j + 1) % len]),
          b: new PIXI.Point(points[i][(j + 2) % len], points[i][(j + 3) % len]),
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
