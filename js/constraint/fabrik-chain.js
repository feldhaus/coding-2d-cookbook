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

  const joints = Array.from({ length: 8 }, () => new PIXI.Point(0, 0));
  const distanceConstraint = 40;

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    joints[0].copyFrom(event.data.global);

    for (let i = 1; i < joints.length; i++) {
      joints[i].copyFrom(
        constrainDistance(joints[i], joints[i - 1], distanceConstraint),
      );
    }

    joints[joints.length - 1].copyFrom(center);
    for (let i = joints.length - 1; i > 0; i--) {
      joints[i - 1].copyFrom(
        constrainDistance(joints[i - 1], joints[i], distanceConstraint),
      );
    }

    draw();
  });

  function draw() {
    graphics.clear();

    graphics.circle(joints[0].x, joints[0].y, 10);
    graphics.fill({ color: color.pink });
    graphics.circle(joints[0].x, joints[0].y, distanceConstraint);
    graphics.stroke({ width: 1, color: color.pink, alpha: 0.25 });

    for (let i = 0; i < joints.length - 1; i++) {
      graphics.moveTo(joints[i].x, joints[i].y);
      graphics.lineTo(joints[i + 1].x, joints[i + 1].y);
      graphics.stroke({ width: 2, color: color.pink });

      graphics.circle(joints[i + 1].x, joints[i + 1].y, 10);
      graphics.fill({ color: color.pink });
      graphics.circle(joints[i + 1].x, joints[i + 1].y, distanceConstraint);
      graphics.stroke({ width: 1, color: color.pink, alpha: 0.25 });
    }
  }

  function constrainDistance(point, anchor, distance) {
    if (distanceBetween(point, anchor) < distance) return point;

    const vector = normalize({ x: point.x - anchor.x, y: point.y - anchor.y });
    vector.x *= distance;
    vector.y *= distance;
    vector.x += anchor.x;
    vector.y += anchor.y;

    return vector;
  }

  function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  function distanceBetween(p0, p1) {
    return magnitude({ x: p1.x - p0.x, y: p1.y - p0.y });
  }

  function normalize(vector) {
    const mag = magnitude(vector);
    if (mag > 0) {
      vector.x /= mag;
      vector.y /= mag;
    }
    return vector;
  }
})();
