// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };

// create application
const app = new PIXI.Application({
  backgroundColor: COLOR.grey,
  antialias: true,
});
document.body.appendChild(app.view);

const center = new PIXI.Point(
  app.renderer.width * 0.5,
  app.renderer.height * 0.5
);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// add interactive dots
const dot1 = createDot();
app.stage.addChild(dot1);
dot1.position.set(100, 100);

const dot2 = createDot();
app.stage.addChild(dot2);
dot2.position.set(700, 500);

function createDot() {
  const g = new PIXI.Graphics();
  g.beginFill(COLOR.pink, 0.05);
  g.drawCircle(0, 0, 30);
  g.beginFill(COLOR.pink);
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
    draw();
  });
  return g;
}

function draw() {
  graphics.clear();
  graphics.lineStyle(2, COLOR.white);
  graphics.moveTo(dot1.x, dot1.y);
  graphics.lineTo(dot2.x, dot2.y);

  graphics.drawCircle(400, 300, 100);

  // get intersection
  const result1 = {};
  const result2 = {};
  circleLineIntersection(
    { x: center.x, y: center.y, radius: 100 },
    { start: dot1, end: dot2 },
    result1,
    result2
  );

  if (Object.keys(result1).length > 0) {
    graphics.beginFill(COLOR.white);
    graphics.drawCircle(result1.x, result1.y, 5);
    graphics.endFill();
  }

  if (Object.keys(result2).length > 0) {
    graphics.beginFill(COLOR.white);
    graphics.drawCircle(result2.x, result2.y, 5);
    graphics.endFill();
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
