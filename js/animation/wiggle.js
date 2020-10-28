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
const rate = 1 / (app.ticker.FPS * 5); // 5 seconds
const amplitude = Math.PI / 4;
const frequency = 10;

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
graphics.lineStyle(2, color.pink);
graphics.drawRect(-100, -100, 200, 200);
graphics.position.copyFrom(center);

// runs an update loop
let threshold = 0;
app.ticker.add(function (deltaTime) {
  threshold = (threshold + deltaTime * rate) % 1;
  graphics.rotation = amplitude * Math.sin(threshold * Math.PI * frequency) * Math.max(0, 0.8 - threshold);
});
