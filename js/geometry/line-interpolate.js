// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const DURATION = 180;

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

const dot1 = createDot(100, 500);
app.stage.addChild(dot1);

const dot2 = createDot(700, 100);
app.stage.addChild(dot2);

// runs an update loop
let elapsedTime = 0;
app.ticker.add(function(deltaTime) {
    update(deltaTime);
});

function update(deltaTime) {
    elapsedTime += deltaTime;
    draw((elapsedTime % DURATION) / DURATION);
}

function draw(t) {
    graphics.clear();
    graphics.lineStyle(2, COLOR.white);
    graphics.moveTo(dot1.x, dot1.y);
    graphics.lineTo(dot2.x, dot2.y);
    const interpolate = lineInterpolate(dot1, dot2, t);
    graphics.beginFill(COLOR.grey);
    graphics.drawCircle(interpolate.x, interpolate.y, 5);
};

function createDot(x, y) {
    // create a PIXI graphics object
    const dot = new PIXI.Graphics();
    dot.beginFill(COLOR.pink, 0.05);
    dot.drawCircle(0, 0, 30);
    dot.beginFill(COLOR.pink);
    dot.drawCircle(0, 0, 5);
    dot.position.set(x, y);

    // enable the dot to be interactive
    // this will allow it to respond to mouse and touch events
    dot.interactive = true;

    // this button mode will mean the hand cursor appears
    // when you roll over the bunny with your mouse
    dot.buttonMode = true;

    dot.on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    return dot;
}

function onDragStart(event) {
    this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd(event) {
    this.alpha = 1;
    this.dragging = false;
}

function onDragMove(event) {
    if (!this.dragging) return;
    const position = event.data.getLocalPosition(this.parent);
    this.position.set(position.x, position.y);
}

// translates a point by an angle in radians and distance
function pointTranslate(point, angle, distance) {
    return new PIXI.Point(
        point.x + distance * Math.cos(angle),
        point.y + distance * Math.sin(angle),
    );
}

// calculates the angle of a line, in degrees
function lineAngle(lineStart, lineEnd) {
    return Math.atan2(lineEnd.y - lineStart.y, lineEnd.x - lineStart.x);
}

// calculates the distance between the endpoints of a line segment
function lineLength(lineStart, lineEnd) {
    return Math.sqrt(
        (lineEnd.x - lineStart.x) ** 2 + (lineEnd.y - lineStart.y) ** 2
    );
}

// intermediate values interpolate from start to end along the line segment
function lineInterpolate(lineStart, lineEnd, t) {
    if (t === 0) return lineStart;
    if (t === 1) return lineEnd;
    return pointTranslate(
        lineStart,
        lineAngle(lineStart, lineEnd),
        lineLength(lineStart, lineEnd) * t
    );
}
