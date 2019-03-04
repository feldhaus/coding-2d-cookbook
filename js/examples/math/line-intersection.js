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

// create application
const app = new PIXI.Application(WIDTH, HEIGHT, {
    backgroundColor: COLOR.gunmetal,
    antialias: true
});
document.body.appendChild(app.view);

// add tip
const tip = new PIXI.Text(
    'DRAG and DROP the dots:',
    FONTSTYLE
);
app.stage.addChild(tip);
tip.position.set(5, 5);

// draw the feedback
const feedback = new PIXI.Graphics();
app.stage.addChild(feedback);

// add interactive dots
const dot1 = createDot(100, 100);
app.stage.addChild(dot1);

const dot2 = createDot(500, 280);
app.stage.addChild(dot2);

const dot3 = createDot(200, 400);
app.stage.addChild(dot3);

const dot4 = createDot(300, 120);
app.stage.addChild(dot4);

// ticker for doing render updates
app.ticker.add(function() {
    // clear feedback
    feedback.clear();
    
    // set line style
    feedback.lineStyle(1, COLOR.isabelline);
    
    // draw a line between dot1 and dot2
    feedback.moveTo(dot1.x, dot1.y);
    feedback.lineTo(dot2.x, dot2.y);
    
    // draw a line between dot3 and dot4
    feedback.moveTo(dot3.x, dot3.y);
    feedback.lineTo(dot4.x, dot4.y);
    
    // get intersection
    const intersection = checkLineIntersection(dot1, dot2, dot3, dot4);
    if (intersection.onLine1 || intersection.onLine2) {
        if (intersection.onLine1 && intersection.onLine2) {
            feedback.beginFill(COLOR.isabelline);
        } else {
            feedback.beginFill(COLOR.gunmetal);
        }
        feedback.drawCircle(intersection.x, intersection.y, 5);
    } else {
        // no intersection
    }
});

function createDot (x, y) {
    // create a PIXI graphics object
    const dot = new PIXI.Graphics();
    dot.beginFill(COLOR.darkpink);
    dot.drawCircle(0, 0, 10);
    dot.position.set(x, y);
    
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

function onDragStart (event) {
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd () {
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
}

function onDragMove () {
    if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}

function checkLineIntersection (line1Start, line1End, line2Start, line2End) {
    const result = {x: null, y: null, onLine1: false, onLine2: false};

    // if the feedback intersect, the result contains the x and y
    // of the intersection (treating the feedback as infinite) and
    // booleans for whether line segment 1 or line segment 2 contain the point
    const denominator =
        ((line2End.y - line2Start.y) * (line1End.x - line1Start.x)) -
        ((line2End.x - line2Start.x) * (line1End.y - line1Start.y));

    if (denominator === 0) {
        return result;
    }
    
    let a = line1Start.y - line2Start.y;
    let b = line1Start.x - line2Start.x;
    const numerator1 = 
        ((line2End.x - line2Start.x) * a) -
        ((line2End.y - line2Start.y) * b);
    const numerator2 = 
        ((line1End.x - line1Start.x) * a) -
        ((line1End.y - line1Start.y) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these feedback infinitely in both directions, they intersect here:
    result.x = line1Start.x + (a * (line1End.x - line1Start.x));
    result.y = line1Start.y + (a * (line1End.y - line1Start.y));

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
