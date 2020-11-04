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
const radius = 100;
const wavesLength = 300;
const tau = Math.PI * 2; // alias for two pi
const rate = 1 / (app.ticker.FPS * 5); // 5 seconds

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

const circle = new PIXI.Point(center.x - 200, center.y);

// runs an update loop
let threshold = 0;
app.ticker.add(function (deltaTime) {
  threshold += deltaTime * rate;
  threshold %= 1;
  
  const angle = (threshold * tau) % tau;

  graphics.clear();
  graphics.lineStyle(2, color.pink);
  graphics.drawCircle(circle.x, circle.y, radius);

  const p0 = pointTranslate(circle, 0, radius);
  const p1 = pointTranslate(circle, angle, radius);
  const p2 = new PIXI.Point(center.x .x, p1.y);
  const p3 = pointTranslate(circle, angle, 50);

  graphics.moveTo(circle.x, circle.y);
  graphics.lineTo(p0.x, p0.y);
  graphics.moveTo(circle.x, circle.y);
  graphics.lineTo(p1.x, p1.y);
  graphics.lineTo(center.x + threshold * wavesLength, p2.y);

  graphics.lineStyle(10, color.pink);
  graphics.moveTo(p3.x, p3.y);
  graphics.arc(circle.x, circle.y, 50, -angle, 0);

  graphics.lineStyle(2, color.pink);
  graphics.moveTo(center.x + wavesLength, circle.y);
  graphics.lineTo(center.x, circle.y);

  for (let i = 0; i <= wavesLength; i++) {
    const t = i / wavesLength;
    if (t < threshold) {
      graphics.lineStyle(10, color.pink);
    } else {
      graphics.lineStyle(2, color.pink);
    }
    graphics.lineTo(
      center.x + t * wavesLength,
      circle.y - Math.sin(t * tau) * radius
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