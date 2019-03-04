// constants
const WIDTH = 800;
const HEIGHT = 600;
const COLOR = {
    gunmetal: 0x2C363F,
    darkpink: 0xd81b60, // 0xE75A7C,
    isabelline: 0xF2F5EA,
    timberwolf: 0xD6DBD2,
    darkvanilla: 0xBBC7A4,
};
const FONTSTYLE = {
    fontSize: 14,
    fontFamily: "\"Courier New\", Courier, monospace",
    fill: COLOR.timberwolf,
};
const DURATION = 100;
const PATH = 50;

// create application
const app = new PIXI.Application(WIDTH, HEIGHT, {
    backgroundColor: COLOR.gunmetal,
    antialias: true
});
document.body.appendChild(app.view);

// add tip
const tip = new PIXI.Text(
    'DRAG and DROP the dots to change the curve:',
    FONTSTYLE
);
app.stage.addChild(tip);
tip.position.set(5, 5);

// add the feedback
const feedback = new PIXI.Graphics();
app.stage.addChild(feedback);

// add interactive dots
const dot1 = createDot(100, 100, 1);
app.stage.addChild(dot1);

const dot2 = createDot(300, 500, 2);
app.stage.addChild(dot2);

const dot3 = createDot(600, 400, 3);
app.stage.addChild(dot3);

const dot4 = createDot(700, 120, 4);
app.stage.addChild(dot4);

// circle that will walk along the path
const walker = new PIXI.Graphics();
app.stage.addChild(walker);
walker.lineStyle(5, COLOR.darkpink);
walker.drawCircle(0, 0, 20);

// runs an update loop
let elapsedTime = 0;
app.ticker.add(function(deltaTime) { update(deltaTime); });

function createDot (x, y, id) {
    // create a PIXI graphics object
    const dot = new PIXI.Graphics();
    dot.beginFill(COLOR.darkpink);
    dot.drawCircle(0, 0, 20);
    dot.position.set(x, y);
    dot.dragOffset = new PIXI.Point();

    const txt = new PIXI.Text(id.toString(), {
        fill: COLOR.isabelline,
        fontSize: 16
    });
    txt.anchor.set(0.5, 0.5);
    dot.addChild(txt);
    
    // enable the dot to be interactive
    // this will allow it to respond to mouse and touch events
    dot.interactive = true;
    
    // this button mode will mean the hand cursor appears
    // when you roll over the bunny with your mouse
    dot.buttonMode = true;
    
    dot
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    return dot;
}

// drag functions
function onDragStart (event) {
    this.dragging = true;
    const position = event.data.getLocalPosition(this.parent);
    this.dragOffset.set(position.x - this.x, position.y - this.y);
}

function onDragEnd (event) {
    this.dragging = false;
}

function onDragMove (event) {
    if (this.dragging) {
        const position = event.data.getLocalPosition(this.parent);
        this.position.set(
            position.x - this.dragOffset.x,
            position.y - this.dragOffset.y
        );
        draw();
    }
}

function update (deltaTime) {
    elapsedTime += deltaTime;
    const t = (elapsedTime % DURATION) / DURATION;
    walker.position = cubicBezier(t, dot1, dot2, dot3, dot4);
}

function draw () {
    feedback.clear();

    feedback.lineStyle(0.5, COLOR.darkpink);
    feedback.moveTo(dot1.x, dot1.y);
    feedback.lineTo(dot2.x, dot2.y);
    feedback.lineTo(dot3.x, dot3.y);
    feedback.lineTo(dot4.x, dot4.y);

    feedback.lineStyle(0);
    feedback.beginFill(COLOR.isabelline);
    for (let i = 0; i < PATH; i++) {
        const pt = cubicBezier(i / PATH, dot1, dot2, dot3, dot4);
        feedback.drawCircle(pt.x, pt.y, 2);
    }
}

function cubicBezier(t, p1, p2, p3, p4) {
    const t1 = 1 - t;
    return new PIXI.Point(
        t1**3*p1.x + 3*t1**2*t*p2.x + 3*t1*t**2*p3.x + t**3*p4.x,
        t1**3*p1.y + 3*t1**2*t*p2.y + 3*t1*t**2*p3.y + t**3*p4.y
    );
}

draw();