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

const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.beginFill(color.pink);
circle1.drawCircle(0, 0, 50);
circle1.position.set(center.x - 200, center.y);

const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.beginFill(color.pink);
circle2.drawCircle(0, 0, 50);
circle2.position.copyFrom(center);

const circle3 = new PIXI.Graphics();
app.stage.addChild(circle3);
circle3.beginFill(color.pink);
circle3.drawCircle(0, 0, 50);
circle3.position.set(center.x + 200, center.y);

// runs an update loop
let elapsedTime = 0;
app.ticker.add(function (deltaTime) {
  elapsedTime += deltaTime;
  circle1.y = center.y + Math.cos(elapsedTime * 0.02) * 100;
  circle2.y = center.y + Math.cos(elapsedTime * 0.04) * 100;
  circle3.y = center.y + Math.cos(elapsedTime * 0.08) * 100;
});
