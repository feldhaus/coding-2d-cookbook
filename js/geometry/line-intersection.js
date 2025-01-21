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

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  const circle1 = createCircle();
  app.stage.addChild(circle1);
  circle1.position.set(100, 100);

  const circle2 = createCircle();
  app.stage.addChild(circle2);
  circle2.position.set(700, 380);

  const circle3 = createCircle();
  app.stage.addChild(circle3);
  circle3.position.set(200, 500);

  const circle4 = createCircle();
  app.stage.addChild(circle4);
  circle4.position.set(300, 120);

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

  [circle1, circle2, circle3, circle4].forEach((item) => {
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

    // draw a line between dot1 and dot2
    graphics.moveTo(circle1.x, circle1.y);
    graphics.lineTo(circle2.x, circle2.y);

    // draw a line between dot3 and dot4
    graphics.moveTo(circle3.x, circle3.y);
    graphics.lineTo(circle4.x, circle4.y);

    graphics.stroke({ width: 2, color: color.white });

    // get intersection
    const intersection = lineIntersection(circle1, circle2, circle3, circle4);
    if (intersection.onLine1 || intersection.onLine2) {
      graphics.circle(intersection.x, intersection.y, 5);
      if (intersection.onLine1 && intersection.onLine2) {
        graphics.fill({ color: color.white });
      } else {
        graphics.fill({ color: color.pink });
      }
    } else {
      // no intersection
    }
  }
  draw();

  function lineIntersection(line1Start, line1End, line2Start, line2End) {
    const result = { x: null, y: null, onLine1: false, onLine2: false };

    // if the graphics intersect, the result contains the x and y
    // of the intersection (treating the graphics as infinite) and
    // booleans for whether line segment 1 or line segment 2 contain the point
    const denominator =
      (line2End.y - line2Start.y) * (line1End.x - line1Start.x) -
      (line2End.x - line2Start.x) * (line1End.y - line1Start.y);

    if (denominator === 0) {
      return result;
    }

    let a = line1Start.y - line2Start.y;
    let b = line1Start.x - line2Start.x;
    const numerator1 =
      (line2End.x - line2Start.x) * a - (line2End.y - line2Start.y) * b;
    const numerator2 =
      (line1End.x - line1Start.x) * a - (line1End.y - line1Start.y) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these graphics infinitely in both directions, they intersect here
    result.x = line1Start.x + a * (line1End.x - line1Start.x);
    result.y = line1Start.y + a * (line1End.y - line1Start.y);

    // if line1 is a segment and line2 is infinite
    if (a > 0 && a < 1) {
      result.onLine1 = true;
    }

    // if line2 is a segment and line1 is infinite
    if (b > 0 && b < 1) {
      result.onLine2 = true;
    }

    // if line1 and line2 are segments,
    // they intersect if both of the above are true
    return result;
  }
})();
