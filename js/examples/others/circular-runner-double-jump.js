// constants
const COLOR = {
    grey: 0x21252f,
    pink: 0xec407a,
    white: 0xf2f5ea
};

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true
});
document.body.appendChild(app.view);

// variables
let radius1 = 150;
let radius2 = 20;
let gravity = 0.8;
let playerSpeed = 0.01;
let currentRadians = 0;
let jumps = 0;
let jumpOffset = 0;
let jumpForce = 0;

// add circle 1
const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.beginFill(COLOR.white);
circle1.drawCircle(0, 0, radius1);
circle1.position.set(app.renderer.width / 2, app.renderer.height / 2);

// add circle 2
const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.beginFill(COLOR.pink);
circle2.drawCircle(0, 0, radius2);

// runs an update loop
app.ticker.add(function(delta) { update(); });

// listen pointer down event
app.renderer.plugins.interaction.on('pointerdown', jump);

// listen keydown event
document.onkeydown = function (event) {
    if (event.keyCode === 39) {
        radius1 = Math.min(radius1 + 1, 150);
    } else if (event.keyCode === 37) {
        radius1 = Math.max(radius1 - 1, 80);
    }
    circle1.clear();
    circle1.beginFill(COLOR.white);
    circle1.drawCircle(0, 0, radius1);
}

function update () {
    // is jumping?
    if (jumps > 0) {
        jumpOffset += jumpForce;
        jumpForce -= gravity;
        if (jumpOffset < 0) {
            jumpOffset = 0;
            jumpForce = 0;
            jumps = 0;
        }
    }

    // update circle2 position
    const distanceFromCenter = (radius1 + radius2) + jumpOffset;
    currentRadians += playerSpeed;
    circle2.position.set(
        app.renderer.width / 2 + distanceFromCenter * Math.cos(currentRadians),
        app.renderer.height / 2 + distanceFromCenter * Math.sin(currentRadians)
    );
}

function jump () {
    // double jump
    if (jumps < 2) {
        jumps++;
        jumpForce = 12;
    }
}
