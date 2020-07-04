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
const center = new PIXI.Point(
  app.renderer.width * 0.5,
  app.renderer.height * 0.5
);

// add circles
const circle1 = createCircle(150);
app.stage.addChild(circle1);
circle1.position.set(center.x - 100, center.y);

const circle2 = createCircle(100);
app.stage.addChild(circle2);
circle2.position.set(center.x + 100, center.y);

// add rect 1
const rect1 = new PIXI.Sprite(PIXI.Texture.WHITE);
app.stage.addChild(rect1);
rect1.anchor.set(0.5, 0.5);
rect1.tint = color.pink;

// add rect 2
const rect2 = new PIXI.Sprite(PIXI.Texture.WHITE);
app.stage.addChild(rect2);
rect2.anchor.set(0.5, 0.5);
rect2.tint = color.pink;

function createCircle(radius) {
  const g = new PIXI.Graphics();
  g.beginFill(color.white, 0.05);
  g.drawCircle(0, 0, radius + 20);
  g.beginFill(0, 0);
  g.lineStyle(3, color.white);
  g.drawCircle(0, 0, radius);
  g.interactive = g.buttonMode = true;
  g.offset = new PIXI.Point();
  g.radius = radius;
  // listeners
  g.on('pointerdown', (event) => {
    g.dragging = true;
    g.offset.set(event.data.global.x - g.x, event.data.global.y - g.y);
  });
  g.on('pointerup', () => {
    g.dragging = false;
  });
  g.on('pointerupoutside', () => {
    g.dragging = false;
  });
  g.on('pointermove', (event) => {
    if (!g.dragging) return;
    g.position.set(
      event.data.global.x - g.offset.x,
      event.data.global.y - g.offset.y
    );
    circleIntersection();
  });
  return g;
}

function circleIntersection() {
  const x1 = circle1.x,
    y1 = circle1.y,
    r1 = circle1.radius;
  const x2 = circle2.x,
    y2 = circle2.y,
    r2 = circle2.radius;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = distanceBetween(circle1, circle2);

  if (distance > r1 + r2) {
    // no intersect
    rect1.visible = false;
    rect2.visible = false;
  } else if (distance < Math.abs(r2 - r1)) {
    // no intersect - one circle is contained within the other
    rect1.visible = false;
    rect2.visible = false;
  } else if (distance === 0 && r1 === r2) {
    // no intersect - the circles are equal and coincident
    rect1.visible = false;
    rect2.visible = false;
  } else {
    rect1.visible = true;
    rect2.visible = true;

    const a = (r1 ** 2 - r2 ** 2 + distance ** 2) / (2 * distance);
    const h = Math.sqrt(r1 ** 2 - a ** 2);
    const x = x1 + (a * dx) / distance;
    const y = y1 + (a * dy) / distance;

    rect1.x = x + (h * dy) / distance;
    rect1.y = y - (h * dx) / distance;

    rect2.x = x - (h * dy) / distance;
    rect2.y = y + (h * dx) / distance;
  }
}
circleIntersection();

// returns the length of a vector
function magnitude(vector) {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

// returns the distance between 2 points
function distanceBetween(p0, p1) {
  return magnitude({ x: p1.x - p0.x, y: p1.y - p0.y });
}
