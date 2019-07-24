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

// draw the feedback
const feedback = new PIXI.Graphics();
app.stage.addChild(feedback);

// create dots
const width = app.renderer.width;
const height = app.renderer.height;
const dotsInner = [];
const dotsOuter = [];
let px, py;
let dot;
for (let i = 0; i < 5; i++) {
    // inner
    px = 100 + Math.random() * (width - 200);
    py = 100 + Math.random() * (height - 200);
    dot = createDot(px, py, COLOR.pink);
    dotsInner.push(dot);
    dotsOuter.push(dot);
    app.stage.addChild(dot);
}
for (let i = 0; i < 10; i++) {
    // outer
    px = 20 + Math.random() * (width - 40);
    py = 20 + Math.random() * (height - 40);
    dot = createDot(px, py, COLOR.white);
    dotsOuter.push(dot);
    app.stage.addChild(dot);
}

function createDot(x, y, color) {
    // create a PIXI graphic object
    const dot = new PIXI.Graphics();
    dot.beginFill(color, 0.05);
    dot.drawCircle(0, 0, 30);
    dot.beginFill(color);
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
    drawConvexHull();
}

// first call
drawConvexHull();

function drawConvexHull() {
    feedback.clear();
    drawLine(dotsInner, COLOR.pink);
    drawLine(dotsOuter, COLOR.white);
}

function drawLine(dots, color) {
    const points = computeConvexHull(dots);

    if (points && points.length > 0) {
        feedback.lineStyle(2, color);
        feedback.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            feedback.lineTo(points[i].x, points[i].y);
        }
        feedback.lineTo(points[0].x, points[0].y);
    }
}

function computeConvexHull(dots) {
    // must to be greater than or equal 3
    if (dots.length < 3) {
        return;
    }

    const points = dots.concat();
    const len = points.length;

    // the first step is to find the point with the lowest y-coordinate,
    // if the lowest y-coordinate exists in more than one point in the set,
    // the point with the lowest x-coordinate out of the candidates should be chose
    let min = 0;
    for (let i = 1; i < len; i++) {
        if (points[i].y === points[min].y) {
            if (points[i].x < points[min].x) {
                min = i;
            }
        } else if (points[i].y < points[min].y) {
            min = i;
        }
    }

    // set the min as the first
    const tmp = points[0];
    points[0] = points[min];
    points[min] = tmp;

    // calculate angle and distance from the lowest point
    for (let i = 0; i < len; i++) {
        points[i].distance = getDistance(points[0], points[i]);
        points[i].angle = getAngle(points[0], points[i]);
        if (points[i].angle < 0) {
            points[i].angle += Math.PI;
        }
    }

    // sort points by angle
    points.sort(function(a, b) {
        return compare(a, b);
    });

    // create a stack
    let n = 2;
    const stack = [points[0], points[1], points[2]];
    for (let i = 3; i < points.length; i++) {
        while (ccw(stack[n - 1], stack[n], points[i]) <= 0) {
            stack.pop();
            n--;
        }
        stack.push(points[i]);
        n++;
    }

    return stack;
}

function getDistance(p1, p2) {
    return (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
}

function getAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// three points are a counter-clockwise turn if ccw > 0, clockwise if
// ccw < 0, and collinear if ccw = 0 because ccw is a determinant that
// gives twice the signed area of the triangle formed by p1, p2 and p3.
function ccw(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

function compare(p1, p2) {
    if (p1.angle < p2.angle) {
        return -1;
    } else if (p1.angle > p2.angle) {
        return 1;
    } else {
        if (p1.distance < p2.distance) {
            return -1;
        } else if (p1.distance > p2.distance) {
            return 1;
        }
    }
    return 0;
}
