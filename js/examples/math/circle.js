// constants
const WIDTH = 800;
const HEIGHT = 600;
const COLOR = {
    gunmetal: 0x2C363F,
    darkpink: 0xE75A7C,
    isabelline: 0xF2F5EA,
    timberwolf: 0xD6DBD2,
    darkvanilla: 0xBBC7A4,
};
const FONTSTYLE = {
    fontSize: 14,
    fontFamily: "\"Courier New\", Courier, monospace",
    fill: COLOR.timberwolf,
};
const PI_2 = Math.PI * 2;
const RADIUS = 150;

// create application
const app = new PIXI.Application(WIDTH, HEIGHT, {
    backgroundColor: COLOR.gunmetal,
    antialias: true
});
document.body.appendChild(app.view);

// add tip
const tip = new PIXI.Text(
    'Use ARROWS (⇧ ⇩) to change the number of slices:',
    FONTSTYLE
);
app.stage.addChild(tip);
tip.position.set(5, 5);

// variables
let slices = 20;
let elapsedTime = 0;

// add circles
const circle = new PIXI.Graphics();
app.stage.addChild(circle);
circle.position.set(WIDTH / 2, HEIGHT / 2);

const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.position.set(100, HEIGHT - 100);

const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.position.set(WIDTH - 100, 100);

// add labels
addText(
    '0, 2π',
    { x: circle.x + RADIUS + 10, y: circle.y },
    { x: 0.0, y: 0.5 }
);
addText(
    'π / 2',
    { x: circle.x, y: circle.y + RADIUS + 10 },
    { x: 0.5, y: 0.0 }
);
addText(
    'π',
    { x: circle.x - RADIUS - 10, y: circle.y },
    { x: 1.0, y: 0.5 }
);
addText(
    '3π / 2',
    { x: circle.x, y: circle.y - RADIUS - 10 },
    { x: 0.5, y: 1.0 }
);

// runs an update loop
app.ticker.add(function(delta) {
    updateMainCircle();
    updateRunningCircle(circle1, 50, 1, 0.1);
    updateRunningCircle(circle2, 30, -1, 0.3);
    elapsedTime += delta;
});

// listen pointer down event
document.onkeydown = function (event) {
    if (event.keyCode === 38) {
        slices = Math.min(slices + 1, 36);
    } else if (event.keyCode === 40) {
        slices = Math.max(slices - 1, 2);
    }
}

function addText (txt, position, anchor) {
    const tip = new PIXI.Text(txt, {
        fontSize: 24,
        fill: COLOR.darkpink
    });
    app.stage.addChild(tip);
    tip.anchor.set(anchor.x, anchor.y);
    tip.position.set(position.x, position.y);
}

function updateMainCircle () {
    let mouse = app.renderer.plugins.interaction.mouse.global;
    let angle = Math.atan2(mouse.y - circle.y, mouse.x - circle.x);
    let hypot = Math.hypot(mouse.x - circle.x, mouse.y - circle.y);
    if (angle < 0) { angle += PI_2; }

    const sliceCirc = PI_2 / slices;
    const temp = angle / sliceCirc;
    
    circle.clear();
    circle.lineStyle(2, COLOR.isabelline);
    for (let i = 0; i < slices; i++) {
        if (temp > i && RADIUS > hypot) {
            circle.beginFill(COLOR.darkpink);
        }
        circle.moveTo(0, 0);
        circle.arc(0, 0, RADIUS, sliceCirc * i, sliceCirc * (i + 1));
        circle.lineTo(0, 0);
        circle.endFill();
    }
}

function updateRunningCircle (shape, radius, direction, speed) {
    const circum = elapsedTime * speed;
    const invert = Math.floor(circum / PI_2) % 2 === 0;

    shape.clear();
    shape.lineStyle(20, COLOR.darkvanilla);
    if (invert) {
        shape.arc(0, 0, radius, 0, circum % PI_2 * direction);
    } else {
        shape.arc(0, 0, radius, circum % PI_2 * direction, 0);
    }
}
