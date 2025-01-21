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
  const points = [];

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', addPoint);

  const star = [
    new PIXI.Point(center.x, center.y - 200),
    new PIXI.Point(center.x + 40, center.y - 45),
    new PIXI.Point(center.x + 190, center.y - 45),
    new PIXI.Point(center.x + 65, center.y + 25),
    new PIXI.Point(center.x + 100, center.y + 175),
    new PIXI.Point(center.x, center.y + 55),
    new PIXI.Point(center.x - 100, center.y + 175),
    new PIXI.Point(center.x - 65, center.y + 25),
    new PIXI.Point(center.x - 190, center.y - 45),
    new PIXI.Point(center.x - 40, center.y - 45),
  ];
  draw(star);

  // add a new point
  function addPoint(event) {
    points.push(new PIXI.Point(event.data.global.x, event.data.global.y));
    draw(points);
  }

  // add a new point
  function draw(points) {
    graphics.clear();

    for (let i = 0; i < points.length; i++) {
      graphics.circle(points[i].x, points[i].y, 2);
      graphics.fill({ color: color.white });
    }

    if (points.length > 2) {
      drawRoundedPolygon(points, 20);
      graphics.stroke({ width: 5, color: color.pink });

      graphics.poly(points, true);
      graphics.stroke({ width: 1, color: color.white, alpha: 0.5 });
    }
  }

  function drawRoundedPolygon(path, radius) {
    const len = path.length;
    for (let i = 0; i < len; i++) {
      // get the current point and the next two
      const p0 = path[i];
      const p1 = path[(i + 1) % len];
      const p2 = path[(i + 2) % len];

      const v0 = new PIXI.Point(p1.x - p0.x, p1.y - p0.y);
      const v1 = new PIXI.Point(p1.x - p2.x, p1.y - p2.y);

      // the length of segment between angular point and the
      // points of intersection with the circle of a given radius
      const angle = (angleBetween(p0, p1) - angleBetween(p2, p1)) / 2;
      const tan = Math.abs(Math.tan(angle));
      const seg0 = radius / tan;

      // check the segment
      const len0 = distanceBetween(p0, p1);
      const len1 = distanceBetween(p2, p1);

      // points of intersection are calculated by the proportion between the
      // coordinates of the vector, length of vector and the length of the segment
      const cross0 = getProportionPoint(p1, v0, seg0, len0);
      const cross1 = getProportionPoint(p1, v1, seg0, len1);

      // calculation of the coordinates of the circle
      // center by the addition of angular vectors
      const cross = new PIXI.Point(
        p1.x * 2 - cross0.x - cross1.x,
        p1.y * 2 - cross0.y - cross1.y,
      );

      const len2 = magnitude(cross);
      const seg1 = magnitude({ x: seg0, y: radius });

      // center radius
      const centerCircle = getProportionPoint(p1, cross, seg1, len2);

      // start and end angle of arc
      const startAngle = angleBetween(centerCircle, cross0);
      const endAngle = angleBetween(centerCircle, cross1);

      // get clock wise direction to draw the arc
      let sweepAngle = endAngle - startAngle;
      if (sweepAngle < -Math.PI) {
        sweepAngle = tau + sweepAngle;
      } else if (sweepAngle > Math.PI) {
        sweepAngle = sweepAngle - tau;
      }
      const anticlockwise = sweepAngle < 0 || sweepAngle > Math.PI;

      if (i === 0) {
        graphics.moveTo(cross0.x, cross0.y);
      } else {
        graphics.lineTo(cross0.x, cross0.y);
      }

      // draw the arc to connect the next vector
      graphics.arc(
        centerCircle.x,
        centerCircle.y,
        radius,
        startAngle,
        endAngle,
        anticlockwise,
      );
    }

    // close the path
    graphics.closePath();
  }

  function getProportionPoint(p0, p1, segment, length) {
    const factor = segment / length;
    return new PIXI.Point(p0.x - p1.x * factor, p0.y - p1.y * factor);
  }

  // returns the length of a vector
  function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  // returns the angle between 2 points, in radians
  function angleBetween(p0, p1) {
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
  }

  // returns the distance between 2 points
  function distanceBetween(p0, p1) {
    return magnitude({ x: p1.x - p0.x, y: p1.y - p0.y });
  }
})();
