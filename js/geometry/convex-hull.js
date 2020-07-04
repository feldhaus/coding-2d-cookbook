// create application
const app = new PIXI.Application({
  backgroundColor: 0x21252f,
  antialias: true,
  width: 800,
  height: 600,
});
document.body.appendChild(app.view);

// constants
const color = { pink: 0xec407a, white: 0xf2f5ea };
const width = app.renderer.width;
const height = app.renderer.height;

// draw the feedback
const feedback = new PIXI.Graphics();
app.stage.addChild(feedback);

// create dots
const dotsInner = [];
const dotsOuter = [];
let dot;
for (let i = 0; i < 5; i++) {
  // inner
  dot = createDot(color.pink);
  dot.position.set(
    100 + Math.random() * (width - 200),
    100 + Math.random() * (height - 200)
  );
  dotsInner.push(dot);
  dotsOuter.push(dot);
  app.stage.addChild(dot);
}
for (let i = 0; i < 10; i++) {
  // outer
  dot = createDot(color.white);
  dot.position.set(
    20 + Math.random() * (width - 40),
    20 + Math.random() * (height - 40)
  );
  dotsOuter.push(dot);
  app.stage.addChild(dot);
}

function createDot(color) {
  const g = new PIXI.Graphics();
  g.beginFill(color, 0.05);
  g.drawCircle(0, 0, 30);
  g.beginFill(color);
  g.drawCircle(0, 0, 5);
  g.interactive = g.buttonMode = true;
  g.offset = new PIXI.Point();
  // listeners
  g.on('pointerdown', (event) => {
    g.alpha = 0.5;
    g.offset.set(event.data.global.x - g.x, event.data.global.y - g.y);
  });
  g.on('pointerup', () => {
    g.alpha = 1;
  });
  g.on('pointerupoutside', () => {
    g.alpha = 1;
  });
  g.on('pointermove', (event) => {
    if (g.alpha === 1) return;
    g.position.set(
      event.data.global.x - g.offset.x,
      event.data.global.y - g.offset.y
    );
    drawConvexHull();
  });
  return g;
}

function drawConvexHull() {
  feedback.clear();
  drawLine(dotsInner, color.pink);
  drawLine(dotsOuter, color.white);
}
drawConvexHull();

function drawLine(dots, color) {
  const points = computeConvexHull(dots);

  if (points && points.length > 0) {
    feedback.lineStyle(2, color);
    feedback.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      feedback.lineTo(points[i].x, points[i].y);
    }
    feedback.lineTo(points[0].x, points[0].y);
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
    points[i].distance = distanceBetween(points[0], points[i]);
    points[i].angle = angleBetween(points[0], points[i]);
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

// returns the length of a vector
function magnitude(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

// returns the distance between 2 points
function distanceBetween(p0, p1) {
  return magnitude({ x: p1.x - p0.x, y: p1.y - p0.y });
}

// returns the angle between 2 points, in radians
function angleBetween(p0, p1) {
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
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
