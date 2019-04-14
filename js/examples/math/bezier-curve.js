// constants
const COLOR = {
    grey: 0x21252f,
    pink: 0xec407a,
    white: 0xf2f5ea
};
const DURATION = 100;
const PATH = 50;

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true
});
document.body.appendChild(app.view);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// create and add interactive dots
const dot1 = createDot(100, 500, 1);
app.stage.addChild(dot1);

const dot2 = createDot(200, 200, 2);
app.stage.addChild(dot2);

const dot3 = createDot(600, 100, 3);
app.stage.addChild(dot3);

const dot4 = createDot(700, 450, 4);
app.stage.addChild(dot4);

// circle that will walk along the path
const walker = new PIXI.Graphics();
app.stage.addChild(walker);
walker.lineStyle(5, COLOR.pink);
walker.drawCircle(0, 0, 20);

// runs an update loop
let elapsedTime = 0;
app.ticker.add(function(deltaTime) { update(deltaTime); });

function createDot(x, y, id) {
    // create a PIXI graphics object
    const dot = new PIXI.Graphics();
    dot.beginFill(COLOR.pink, 0.05);
    dot.drawCircle(0, 0, 50);
    dot.beginFill(COLOR.pink);
    dot.drawCircle(0, 0, 20);
    dot.position.set(x, y);
    dot.dragOffset = new PIXI.Point();

    const txt = new PIXI.Text(id.toString(), {
        fill: COLOR.white,
        fontSize: 20
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
function onDragStart(event) {
    this.dragging = true;
    const position = event.data.getLocalPosition(this.parent);
    this.dragOffset.set(position.x - this.x, position.y - this.y);
}

function onDragEnd(event) {
    this.dragging = false;
}

function onDragMove(event) {
    if (!this.dragging) return;
    const position = event.data.getLocalPosition(this.parent);
    this.position.set(
        position.x - this.dragOffset.x,
        position.y - this.dragOffset.y
    );
    draw();
}

function update(deltaTime) {
    elapsedTime += deltaTime;
    const t = (elapsedTime % DURATION) / DURATION;
    walker.position = cubicBezier(t, dot1, dot2, dot3, dot4);
}

// first call
draw();

function draw() {
    graphics.clear();

    // line between dots
    graphics.lineStyle(5, COLOR.pink, 0.25);
    graphics.moveTo(dot1.x, dot1.y);
    graphics.lineTo(dot2.x, dot2.y);
    graphics.lineTo(dot3.x, dot3.y);
    graphics.lineTo(dot4.x, dot4.y);

    // draw path
    graphics.lineStyle(0);
    graphics.beginFill(COLOR.white);
    for (let i = 0; i < PATH; i++) {
        const pt = cubicBezier(i / PATH, dot1, dot2, dot3, dot4);
        graphics.drawCircle(pt.x, pt.y, 2);
    }
}

function cubicBezier(t, p1, p2, p3, p4) {
    const t1 = 1 - t;
    return new PIXI.Point(
        t1**3*p1.x + 3*t1**2*t*p2.x + 3*t1*t**2*p3.x + t**3*p4.x,
        t1**3*p1.y + 3*t1**2*t*p2.y + 3*t1*t**2*p3.y + t**3*p4.y
    );
}
