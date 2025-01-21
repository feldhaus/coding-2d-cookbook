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
  const points = [];

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', addPoint);

  const star = [
    new PIXI.Point(center.x, center.y - 150),
    new PIXI.Point(center.x + 30, center.y - 45),
    new PIXI.Point(center.x + 145, center.y - 45),
    new PIXI.Point(center.x + 50, center.y + 20),
    new PIXI.Point(center.x + 80, center.y + 125),
    new PIXI.Point(center.x, center.y + 55),
    new PIXI.Point(center.x - 80, center.y + 125),
    new PIXI.Point(center.x - 50, center.y + 20),
    new PIXI.Point(center.x - 145, center.y - 45),
    new PIXI.Point(center.x - 30, center.y - 45),
  ];
  draw(star);

  // add a new point
  function addPoint(event) {
    points.push(new PIXI.Point(event.data.global.x, event.data.global.y));
    draw(points);
  }

  function draw(points) {
    graphics.clear();

    for (let i = 0; i < points.length; i++) {
      graphics.circle(points[i].x, points[i].y, 2);
      graphics.fill({ color: color.white });
    }

    if (points.length > 2) {
      for (let i = 0; i < 3; i++) {
        graphics.poly(straightSkeleton(points, (i + 1) * 10));
        graphics.poly(straightSkeleton(points, (i + 1) * -10));
        graphics.stroke({
          width: 3 - i,
          color: color.pink,
          alpha: 1 - i * 0.1,
        });
      }

      graphics.poly(points, true);
      graphics.stroke({ width: 1, color: color.white, alpha: 1 });
    }
  }

  function straightSkeleton(path, spacing) {
    const order = polygonOrder(path);
    spacing *= Math.sign(order);

    const resultingPath = [];
    const len = path.length;

    for (let i = 0; i < len; i++) {
      const p0 = path[i % len];
      const p1 = path[(i + 1) % len];
      const p2 = path[(i + 2) % len];

      const a0 = new PIXI.Point(p1.x - p0.x, p1.y - p0.y);
      const a1 = new PIXI.Point(p2.x - p1.x, p2.y - p1.y);

      const mi0 = a0.y / a0.x;
      const mi1 = a1.y / a1.x;

      const li0 = magnitude(a0);
      const li1 = magnitude(a1);

      const ri0 = p0.x + (spacing * a0.y) / li0;
      const ri1 = p1.x + (spacing * a1.y) / li1;

      const si0 = p0.y - (spacing * a0.x) / li0;
      const si1 = p1.y - (spacing * a1.x) / li1;

      const point = new PIXI.Point(
        (mi1 * ri1 - mi0 * ri0 + si0 - si1) / (mi1 - mi0),
        (mi0 * mi1 * (ri1 - ri0) + mi1 * si0 - mi0 * si1) / (mi1 - mi0),
      );

      if (a0.x === 0) {
        point.x = p1.x + (spacing * a0.y) / Math.abs(a0.y);
        point.y = mi1 * point.x - mi1 * ri1 + si1;
      }

      if (a1.x === 0) {
        point.x = p2.x + (spacing * a1.y) / Math.abs(a1.y);
        point.y = mi0 * point.x - mi0 * ri0 + si0;
      }

      resultingPath.push(point);
    }

    return resultingPath;
  }

  function polygonOrder(path) {
    let signedArea = 0;
    const len = path.length;
    for (let i = 0; i < len; i++) {
      p0 = path[i];
      p1 = path[(i + 1) % len];
      signedArea += p0.x * p1.y - p1.x * p0.y;
    }
    return signedArea;
  }

  // returns the length of a vector
  function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }
})();
