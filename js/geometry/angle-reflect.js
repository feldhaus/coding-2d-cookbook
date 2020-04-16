// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const SURFACE_LENGTH = 400;

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
dot1.position.set(center.x - 200, center.y);
dot1.on('pointermove', function (event) {
  if (this.alpha === 1) return;
  const angle = angleBetween(center, this.position);
  const translatePoint = pointTranslate(center, angle, SURFACE_LENGTH * 0.5);
  this.position.copyFrom(translatePoint);
  draw();
});

const dot2 = createDot();
app.stage.addChild(dot2);
dot2.position.set(center.x - 150, center.y - 200);

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

  // get all required values to draw
  const incidenceAngle = angleBetween(dot2, center);
  const incidenceLength = distanceBetween(dot2, center);
  const surfaceAngle = angleBetween(dot1, center);
  const surfacePoint = pointTranslate(dot1, surfaceAngle, SURFACE_LENGTH);
  const reflectAngle = angleReflect(incidenceAngle, surfaceAngle);
  const reflectPoint = pointTranslate(center, reflectAngle, incidenceLength);

  // draw incidence and surface lines
  graphics.lineStyle(2, COLOR.white);
  graphics.moveTo(dot1.x, dot1.y);
  graphics.lineTo(surfacePoint.x, surfacePoint.y);
  graphics.moveTo(dot2.x, dot2.y);
  graphics.lineTo(center.x, center.y);

  // draw reflect line
  graphics.lineStyle(2, COLOR.pink);
  graphics.lineTo(reflectPoint.x, reflectPoint.y);
}
draw();

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

// returns the angle between 2 points, in radians
function angleBetween(p0, p1) {
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

// returns the distance between 2 points
function distanceBetween(p0, p1) {
  return magnitude({ x: p1.x - p0.x, y: p1.y - p0.y });
}

// returns the angle of reflection
function angleReflect(incidenceAngle, surfaceAngle) {
  return surfaceAngle * 2 - incidenceAngle;
}
