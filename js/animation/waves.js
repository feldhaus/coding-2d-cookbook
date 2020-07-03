// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const RADIUS = 100;
const WAVES_LENGTH = 300;
const CIRCUMFERENCE = Math.PI * 2;

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

const circle = new PIXI.Point(center.x - 200, center.y);

// runs an update loop
const rate = 1 / (app.ticker.FPS * 5); // 5 seconds
let threshold = 0;
app.ticker.add(function (deltaTime) {
  threshold += deltaTime * rate;
  threshold %= 1;
  
  const angle = (threshold * CIRCUMFERENCE) % (Math.PI * 2);

  graphics.clear();
  graphics.lineStyle(2, COLOR.pink);
  graphics.drawCircle(circle.x, circle.y, RADIUS);

  const p0 = pointTranslate(circle, 0, RADIUS);
  const p1 = pointTranslate(circle, angle, RADIUS);
  const p2 = new PIXI.Point(center.x .x, p1.y);
  const p3 = pointTranslate(circle, angle, 50);

  graphics.moveTo(circle.x, circle.y);
  graphics.lineTo(p0.x, p0.y);
  graphics.moveTo(circle.x, circle.y);
  graphics.lineTo(p1.x, p1.y);
  graphics.lineTo(center.x + threshold * WAVES_LENGTH, p2.y);

  graphics.lineStyle(10, COLOR.pink);
  graphics.moveTo(p3.x, p3.y);
  graphics.arc(circle.x, circle.y, 50, -angle, 0);

  graphics.lineStyle(2, COLOR.pink);
  graphics.moveTo(center.x + WAVES_LENGTH, circle.y);
  graphics.lineTo(center.x, circle.y);

  for (let i = 0; i <= WAVES_LENGTH; i++) {
    const t = i / WAVES_LENGTH;
    if (t < threshold) {
      graphics.lineStyle(10, COLOR.pink);
    } else {
      graphics.lineStyle(2, COLOR.pink);
    }
    graphics.lineTo(
      center.x + t * WAVES_LENGTH,
      circle.y - Math.sin(t * CIRCUMFERENCE) * RADIUS
    );
  }
});

// translates a point by an angle in radians and distance
function pointTranslate(point, angle, distance) {
  return new PIXI.Point(
    point.x + distance * Math.cos(angle),
    point.y - distance * Math.sin(angle)
  );
}