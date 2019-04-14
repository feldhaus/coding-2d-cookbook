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

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// add interactive dots
const dot1 = createDot(100, 100);
app.stage.addChild(dot1);

const dot2 = createDot(700, 500);
app.stage.addChild(dot2);

// first call
draw();

function draw() {
    graphics.clear();
    graphics.lineStyle(2, COLOR.white);
    graphics.moveTo(dot1.x, dot1.y);
    graphics.lineTo(dot2.x, dot2.y);

    graphics.drawCircle(400, 300, 100);
    
    // get intersection
    const result1 = {};
    const result2 = {};
    circleLineIntersection(
        {x: 400, y: 300, radius: 100},
        {start: dot1, end: dot2},
        result1,
        result2
    );
    if (Object.keys(result1).length > 0) {
        graphics.beginFill(COLOR.white);
        graphics.drawCircle(result1.x, result1.y, 5);
    }
    if (Object.keys(result2).length > 0) {
        graphics.beginFill(COLOR.white);
        graphics.drawCircle(result2.x, result2.y, 5);
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
    
    dot
        .on('pointerdown', onDragStart)
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

function circleLineIntersection(circle, segment, result1, result2) {
    const lx = segment.end.x - segment.start.x;
    const ly = segment.end.y - segment.start.y;

    const len = Math.sqrt(lx**2 + ly**2);

    const dx = lx / len;
    const dy = ly / len;

    const t = dx * (circle.x - segment.start.x) +
              dy * (circle.y - segment.start.y);

    const ex = t * dx + segment.start.x;
    const ey = t * dy + segment.start.y;

    const lec = Math.sqrt((ex - circle.x)**2 + (ey - circle.y)**2);

    if (lec < circle.radius) {
        const dt = Math.sqrt(circle.radius**2 - lec**2);
        const te = dx * lx + dy * ly;

        if (segment) {
            if ((t-dt < 0 || t-dt > te) && (t+dt < 0 || t+dt > te)) {
                // no intersetion
                return;
            } else if (t-dt < 0 || t-dt > te) {
                result1.x = (t + dt) * dx + segment.start.x;
                result1.y = (t + dt) * dy + segment.start.y;
                // single intersection
                return;
            } else if (t+dt < 0 || t+dt > te) {
                result1.x = (t - dt) * dx + segment.start.x;
                result1.y = (t - dt) * dy + segment.start.y;
                // single intersection
                return;
            }
        }

        result1.x = (t - dt) * dx + segment.start.x;
        result1.y = (t - dt) * dy + segment.start.y;
        result2.x = (t + dt) * dx + segment.start.x;
        result2.y = (t + dt) * dy + segment.start.y;

        // intersection
        return;
    } else if (lec === circle.radius) {
        result1.x = ex;
        result1.y = ey;
        result2.x = ex;
        result2.y = ey;
        // tangent
        return;
    }

    // no intersetion
    return;
}
