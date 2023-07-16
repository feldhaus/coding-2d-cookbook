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

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// add interactive dots
const dot1 = createDot();
app.stage.addChild(dot1);
dot1.position.set(100, 100);

const dot2 = createDot();
app.stage.addChild(dot2);
dot2.position.set(700, 380);

const dot3 = createDot();
app.stage.addChild(dot3);
dot3.position.set(200, 500);

const dot4 = createDot();
app.stage.addChild(dot4);
dot4.position.set(300, 120);

function draw() {
  graphics.clear();
  graphics.lineStyle(2, color.white);

  // draw a line between dot1 and dot2
  graphics.moveTo(dot1.x, dot1.y);
  graphics.lineTo(dot2.x, dot2.y);

  // draw a line between dot3 and dot4
  graphics.moveTo(dot3.x, dot3.y);
  graphics.lineTo(dot4.x, dot4.y);

  // get intersection
  const intersection = lineIntersection(dot1, dot2, dot3, dot4);
  if (intersection.onLine1 || intersection.onLine2) {
    if (intersection.onLine1 && intersection.onLine2) {
      graphics.beginFill(color.white);
    } else {
      graphics.beginFill(color.grey);
    }
    graphics.drawCircle(intersection.x, intersection.y, 5);
  } else {
    // no intersection
  }
}
draw();

function createDot() {
  const g = new PIXI.Graphics();
  g.beginFill(color.pink, 0.05);
  g.drawCircle(0, 0, 50);
  g.beginFill(color.pink);
  g.drawCircle(0, 0, 5);
  g.eventMode = 'static';
  g.cursor = 'pointer';
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
    draw();
  });
  return g;
}

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
