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
const duration = 180;

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

const dot1 = createDot();
app.stage.addChild(dot1);
dot1.position.set(100, 500);

const dot2 = createDot();
app.stage.addChild(dot2);
dot2.position.set(700, 100);

// runs an update loop
let elapsedTime = 0;
app.ticker.add(function (deltaTime) {
  update(deltaTime);
});

function update(deltaTime) {
  elapsedTime += deltaTime;
  draw((elapsedTime % duration) / duration);
}

function draw(threshold) {
  graphics.clear();
  graphics.lineStyle(2, color.white);
  graphics.moveTo(dot1.x, dot1.y);
  graphics.lineTo(dot2.x, dot2.y);
  const interpolation = lineInterpolate(dot1, dot2, threshold);
  graphics.beginFill(color.grey);
  graphics.drawCircle(interpolation.x, interpolation.y, 5);
}

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
  });
  return g;
}

// translates a point by an angle in radians and distance
function pointTranslate(point, angle, distance) {
  return new PIXI.Point(
    point.x + distance * Math.cos(angle),
    point.y + distance * Math.sin(angle)
  );
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

// returns the interpolation from start to end along the a segment
function lineInterpolate(p0, p1, threshold) {
  return pointTranslate(
    p0,
    angleBetween(p0, p1),
    distanceBetween(p0, p1) * threshold
  );
}
