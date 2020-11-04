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
const tau = Math.PI * 2; // alias for two pi
const radius = 150;

// variables
let slices = 20;
let elapsedTime = 0;

// add circles
const circle = new PIXI.Graphics();
app.stage.addChild(circle);
circle.position.copyFrom(center);

const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.position.set(100, app.renderer.height - 100);

const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.position.set(app.renderer.width - 100, 100);

// add labels
addText(
  '0, 2π',
  { x: circle.x + radius + 10, y: circle.y },
  { x: 0.0, y: 0.5 }
);
addText(
  'π / 2',
  { x: circle.x, y: circle.y + radius + 10 },
  { x: 0.5, y: 0.0 }
);
addText('π', { x: circle.x - radius - 10, y: circle.y }, { x: 1.0, y: 0.5 });
addText(
  '3π / 2',
  { x: circle.x, y: circle.y - radius - 10 },
  { x: 0.5, y: 1.0 }
);

// runs an update loop
app.ticker.add(function (deltaTime) {
  updateMainCircle();
  updateRunningCircle(circle1, 50, 1, 0.1);
  updateRunningCircle(circle2, 30, -1, 0.3);
  elapsedTime += deltaTime;
});

// listen pointer down event
document.onkeydown = function (event) {
  if (event.keyCode === 38) {
    slices = Math.min(slices + 1, 36);
  } else if (event.keyCode === 40) {
    slices = Math.max(slices - 1, 2);
  }
  event.preventDefault();
};

function addText(txt, position, anchor) {
  const tip = new PIXI.Text(txt, {
    fontSize: 24,
    fill: color.pink,
  });
  app.stage.addChild(tip);
  tip.anchor.set(anchor.x, anchor.y);
  tip.position.set(position.x, position.y);
}

function updateMainCircle() {
  let mouse = app.renderer.plugins.interaction.mouse.global;
  let angle = Math.atan2(mouse.y - circle.y, mouse.x - circle.x);
  let hypot = Math.hypot(mouse.x - circle.x, mouse.y - circle.y);
  if (angle < 0) {
    angle += tau;
  }

  const sliceCirc = tau / slices;
  const temp = angle / sliceCirc;

  circle.clear();
  circle.lineStyle(3, color.white);
  for (let i = 0; i < slices; i++) {
    if (temp > i && radius > hypot) {
      circle.beginFill(color.white, 0.05);
    }
    circle.moveTo(0, 0);
    circle.arc(0, 0, radius, sliceCirc * i, sliceCirc * (i + 1));
    circle.lineTo(0, 0);
    circle.endFill();
  }
}

function updateRunningCircle(shape, radius, direction, speed) {
  const circum = elapsedTime * speed;
  const invert = Math.floor(circum / tau) % 2 === 0;

  shape.clear();
  shape.lineStyle(20, color.white);
  if (invert) {
    shape.arc(0, 0, radius, 0, (circum % tau) * direction);
  } else {
    shape.arc(0, 0, radius, (circum % tau) * direction, 0);
  }
}
