// constants
const COLOR = {
    grey: 0x21252f,
    pink: 0xec407a,
    white: 0xf2f5ea,
};

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// add interactive dots
const dot1 = createDot(100, 100);
app.stage.addChild(dot1);

const dot2 = createDot(700, 380);
app.stage.addChild(dot2);

const dot3 = createDot(200, 500);
app.stage.addChild(dot3);

const dot4 = createDot(300, 120);
app.stage.addChild(dot4);

// first call
draw();

function draw() {
    graphics.clear();
    graphics.lineStyle(2, COLOR.white);

    // draw a line between dot1 and dot2
    graphics.moveTo(dot1.x, dot1.y);
    graphics.lineTo(dot2.x, dot2.y);

    // draw a line between dot3 and dot4
    graphics.moveTo(dot3.x, dot3.y);
    graphics.lineTo(dot4.x, dot4.y);

    // get intersection
    const intersection = lineIntersection(dot1, dot2, dot3, dot4);
    if (intersection.onLine1 || intersection.onLine2) {
        if (intersection.onLine1 && intersection.onLine2) {
            graphics.beginFill(COLOR.white);
        } else {
            graphics.beginFill(COLOR.grey);
        }
        graphics.drawCircle(intersection.x, intersection.y, 5);
    } else {
        // no intersection
    }
}

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
    draw();
}

function lineIntersection(line1Start, line1End, line2Start, line2End) {
    const result = { x: null, y: null, onLine1: false, onLine2: false };

    // if the graphics intersect, the result contains the x and y
    // of the intersection (treating the graphics as infinite) and
    // booleans for whether line segment 1 or line segment 2 contain the point
    const denominator =
        (line2End.y - line2Start.y) * (line1End.x - line1Start.x) -
        (line2End.x - line2Start.x) * (line1End.y - line1Start.y);

    if (denominator === 0) {
        return result;
    }

    let a = line1Start.y - line2Start.y;
    let b = line1Start.x - line2Start.x;
    const numerator1 =
        (line2End.x - line2Start.x) * a - (line2End.y - line2Start.y) * b;
    const numerator2 =
        (line1End.x - line1Start.x) * a - (line1End.y - line1Start.y) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these graphics infinitely in both directions, they intersect here:
    result.x = line1Start.x + a * (line1End.x - line1Start.x);
    result.y = line1Start.y + a * (line1End.y - line1Start.y);

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}
