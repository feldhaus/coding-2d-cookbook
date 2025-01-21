//
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

  const circle1 = createCircle();
  app.stage.addChild(circle1);
  circle1.position.set(100, 100);

  const circle2 = createCircle();
  app.stage.addChild(circle2);
  circle2.position.set(700, 500);

  function createCircle() {
    const g = new PIXI.Graphics();
    g.circle(0, 0, 50);
    g.fill({ color: color.pink, alpha: 0.05 });
    g.circle(0, 0, 5);
    g.fill({ color: color.pink });
    g.eventMode = 'dynamic';
    g.cursor = 'pointer';
    g.offset = new PIXI.Point();
    return g;
  }

  // listen to pointer events
  let dragging = null;
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    if (dragging === null) return;

    dragging.position.set(
      event.data.global.x - dragging.offset.x,
      event.data.global.y - dragging.offset.y,
    );

    draw();
  });

  [circle1, circle2].forEach((item) => {
    item.on('pointerdown', (event) => {
      dragging = item;
      item.alpha = 0.5;
      item.offset.set(
        event.data.global.x - item.x,
        event.data.global.y - item.y,
      );
    });
    item.on('pointerup', () => {
      dragging = null;
      item.alpha = 1;
    });
    item.on('pointerupoutside', () => {
      dragging = null;
      item.alpha = 1;
    });
  });

  function draw() {
    graphics.clear();
    graphics.moveTo(circle1.x, circle1.y);
    graphics.lineTo(circle2.x, circle2.y);
    graphics.circle(400, 300, 100);
    graphics.stroke({ width: 2, color: color.white });

    // get intersection
    const result1 = {};
    const result2 = {};
    circleLineIntersection(
      { x: center.x, y: center.y, radius: 100 },
      { start: circle1, end: circle2 },
      result1,
      result2,
    );

    if (Object.keys(result1).length > 0) {
      graphics.circle(result1.x, result1.y, 5);
      graphics.fill({ color: color.white });
    }

    if (Object.keys(result2).length > 0) {
      graphics.circle(result2.x, result2.y, 5);
      graphics.fill({ color: color.white });
    }
  }
  draw();

  function circleLineIntersection(circle, segment, result1, result2) {
    const p0 = segment.start;
    const p1 = segment.end;
    const d = normalize({ x: p1.x - p0.x, y: p1.y - p0.y });

    const t = d.x * (circle.x - p0.x) + d.y * (circle.y - p0.y);

    const ex = t * d.x + p0.x;
    const ey = t * d.y + p0.y;

    const lec = magnitude({ x: ex - circle.x, y: ey - circle.y });

    if (lec < circle.radius) {
      const dt = Math.sqrt(circle.radius ** 2 - lec ** 2);
      const te = distanceBetween(p0, p1);

      if (segment) {
        if ((t - dt < 0 || t - dt > te) && (t + dt < 0 || t + dt > te)) {
          // no intersetion
          return;
        } else if (t - dt < 0 || t - dt > te) {
          result1.x = (t + dt) * d.x + p0.x;
          result1.y = (t + dt) * d.y + p0.y;
          // single intersection
          return;
        } else if (t + dt < 0 || t + dt > te) {
          result1.x = (t - dt) * d.x + p0.x;
          result1.y = (t - dt) * d.y + p0.y;
          // single intersection
          return;
        }
      }

      result1.x = (t - dt) * d.x + p0.x;
      result1.y = (t - dt) * d.y + p0.y;
      result2.x = (t + dt) * d.x + p0.x;
      result2.y = (t + dt) * d.y + p0.y;

      // intersection
      return;
    } else if (lec === circle.radius) {
      result1.x = ex;
      result1.y = ey;
      result2.x = ex;
      result2.y = ey;
      // tangent
      return;
    }

    // no intersetion
    return;
  }

  // returns the length of a vector
  function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  // returns the distance between 2 points
  function distanceBetween(p0, p1) {
    return magnitude({ x: p1.x - p0.x, y: p1.y - p0.y });
  }

  // returns a normalized vector
  function normalize(vector) {
    const mag = magnitude(vector);
    if (mag > 0) {
      vector.x /= mag;
      vector.y /= mag;
    }
    return vector;
  }
})();
