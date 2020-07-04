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
const gravity = 0.8;
const playerSpeed = 0.02;
const jumpLimit = 2; // double jump
const jumpMaxForce = 12;

// variables
let radius1 = 150;
let radius2 = 20;
let currentRadians = 0;
let jumps = 0;
let jumpOffset = 0;
let jumpForce = 0;

// add circle 1
const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.beginFill(color.white);
circle1.drawCircle(0, 0, radius1);
circle1.position.copyFrom(center);

// add circle 2
const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.beginFill(color.pink);
circle2.drawCircle(0, 0, radius2);

// runs an update loop
app.ticker.add(function (deltaTime) {
  update(deltaTime);
});

// listen pointer down event
app.renderer.plugins.interaction.on('pointerdown', jump);

// listen keydown event
document.onkeydown = function (event) {
  if (event.keyCode === 39) {
    radius1 = Math.min(radius1 + 1, 150);
  } else if (event.keyCode === 37) {
    radius1 = Math.max(radius1 - 1, 80);
  }
  event.preventDefault();

  circle1.clear();
  circle1.beginFill(color.white);
  circle1.drawCircle(0, 0, radius1);
};

function update(deltaTime) {
  // is jumping?
  if (jumps > 0) {
    jumpOffset += jumpForce;
    jumpForce -= gravity * deltaTime;
    if (jumpOffset < 0) {
      jumpOffset = 0;
      jumpForce = 0;
      jumps = 0;
    }
  }

  // update circle2 position
  const distanceFromCenter = radius1 + radius2 + jumpOffset;
  currentRadians += playerSpeed * deltaTime;
  const translatePoint = pointTranslate(
    center,
    currentRadians,
    distanceFromCenter
  );
  circle2.position.copyFrom(translatePoint);
}

function jump() {
  if (jumps < jumpLimit) {
    jumps++;
    jumpForce = jumpMaxForce;
  }
}

// translates a point by an angle in radians and distance
function pointTranslate(point, angle, distance) {
  return new PIXI.Point(
    point.x + distance * Math.cos(angle),
    point.y + distance * Math.sin(angle)
  );
}
