// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const GRAVITY = 0.8;
const PLAYER_SPEED = 0.02;
const JUMP_LIMIT = 3; // double jump
const JUMP_FORCE = 12;

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
circle1.beginFill(COLOR.white);
circle1.drawCircle(0, 0, radius1);
circle1.position.copyFrom(center);

// add circle 2
const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.beginFill(COLOR.pink);
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
  circle1.beginFill(COLOR.white);
  circle1.drawCircle(0, 0, radius1);
};

function update(deltaTime) {
  // is jumping?
  if (jumps > 0) {
    jumpOffset += jumpForce;
    jumpForce -= GRAVITY * deltaTime;
    if (jumpOffset < 0) {
      jumpOffset = 0;
      jumpForce = 0;
      jumps = 0;
    }
  }

  // update circle2 position
  const distanceFromCenter = radius1 + radius2 + jumpOffset;
  currentRadians += PLAYER_SPEED * deltaTime;
  const translatePoint = pointTranslate(
    center,
    currentRadians,
    distanceFromCenter
  );
  circle2.position.copyFrom(translatePoint);
}

function jump() {
  if (jumps < JUMP_LIMIT) {
    jumps++;
    jumpForce = JUMP_FORCE;
  }
}

// translates a point by an angle in radians and distance
function pointTranslate(point, angle, distance) {
  return new PIXI.Point(
    point.x + distance * Math.cos(angle),
    point.y + distance * Math.sin(angle)
  );
}
