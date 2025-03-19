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
  const width = app.renderer.width;
  const height = app.renderer.height;

  // add graphics
  const feedback = new PIXI.Graphics();
  app.stage.addChild(feedback);

  const innerCircles = [];
  const outerCircles = [];
  // inner
  for (let i = 0; i < 5; i++) {
    const circle = createCircle(color.pink);
    circle.position.set(
      100 + Math.random() * (width - 200),
      100 + Math.random() * (height - 200),
    );
    innerCircles.push(circle);
    outerCircles.push(circle);
    app.stage.addChild(circle);
  }
  // outer
  for (let i = 0; i < 10; i++) {
    const circle = createCircle(color.white);
    circle.position.set(
      20 + Math.random() * (width - 40),
      20 + Math.random() * (height - 40),
    );
    outerCircles.push(circle);
    app.stage.addChild(circle);
  }

  function createCircle(color) {
    const g = new PIXI.Graphics();
    g.circle(0, 0, 30);
    g.fill({ color, alpha: 0.05 });
    g.circle(0, 0, 5);
    g.fill({ color });
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

    drawConvexHull();
  });

  [...innerCircles, ...outerCircles].forEach((item) => {
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

  function drawConvexHull() {
    feedback.clear();
    drawLine(innerCircles, color.pink);
    drawLine(outerCircles, color.white);
  }
  drawConvexHull();

  function drawLine(dots, color) {
    const points = computeConvexHull(dots);

    if (points && points.length > 0) {
      feedback.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        feedback.lineTo(points[i].x, points[i].y);
      }
      feedback.lineTo(points[0].x, points[0].y);
      feedback.stroke({ width: 2, color });
    }
  }

  function computeConvexHull(dots) {
    // must to be greater than or equal 3
    if (dots.length < 3) {
      return;
    }

    const points = dots.concat();
    const len = points.length;

    // the first step is to find the point with the lowest y-coordinate,
    // if the lowest y-coordinate exists in more than one point in the set,
    // the point with the lowest x-coordinate out of the candidates should be chose
    let min = 0;
    for (let i = 1; i < len; i++) {
      if (points[i].y === points[min].y) {
        if (points[i].x < points[min].x) {
          min = i;
        }
      } else if (points[i].y < points[min].y) {
        min = i;
      }
    }

    // set the min as the first
    const tmp = points[0];
    points[0] = points[min];
    points[min] = tmp;

    // calculate angle and distance from the lowest point
    for (let i = 0; i < len; i++) {
      points[i].distance = FVector.distanceBetween(points[0], points[i]);
      points[i].angle = FVector.angleBetween(points[0], points[i]);
      if (points[i].angle < 0) {
        points[i].angle += Math.PI;
      }
    }

    // sort points by angle
    points.sort(function (a, b) {
      return compare(a, b);
    });

    // create a stack
    let n = 2;
    const stack = [points[0], points[1], points[2]];
    for (let i = 3; i < points.length; i++) {
      while (ccw(stack[n - 1], stack[n], points[i]) <= 0) {
        stack.pop();
        n--;
      }
      stack.push(points[i]);
      n++;
    }

    return stack;
  }

  // three points are a counter-clockwise turn if ccw > 0, clockwise if
  // ccw < 0, and collinear if ccw = 0 because ccw is a determinant that
  // gives twice the signed area of the triangle formed by p1, p2 and p3.
  function ccw(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  function compare(p1, p2) {
    if (p1.angle < p2.angle) {
      return -1;
    } else if (p1.angle > p2.angle) {
      return 1;
    } else {
      if (p1.distance < p2.distance) {
        return -1;
      } else if (p1.distance > p2.distance) {
        return 1;
      }
    }
    return 0;
  }
})();
