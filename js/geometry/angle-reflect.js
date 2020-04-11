// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

const center = new PIXI.Point(app.renderer.width / 2, app.renderer.height / 2);
const surfaceLength = 400;

// add interactive dots
const dot1 = createDot(center.x - 200, center.y);
app.stage.addChild(dot1);
dot1.on('pointermove', function (event) {
    if (this.alpha === 1) return;
    const angle = angleBetween(center, event.data.global);
    const point = pointTranslate(center, angle, surfaceLength * 0.5);
    this.position.set(point.x, point.y);
    draw();
});

const dot2 = createDot(center.x - 150, center.y - 200);
app.stage.addChild(dot2);
dot2.on('pointermove', function (event) {
    if (this.alpha === 1) return;
    const position = event.data.getLocalPosition(this.parent);
    this.position.set(position.x, position.y);
    draw();
});

// first call
draw();

function draw() {
    graphics.clear();
    graphics.lineStyle(2, COLOR.white);

    const incidenceAngle = angleBetween(dot2, center);
    const incidenceLength = distanceBetween(dot2, center);
    const surfaceAngle = angleBetween(dot1, center);
    const surfacePoint = pointTranslate(dot1, surfaceAngle, surfaceLength);
    const reflectAngle = angleReflect(incidenceAngle, surfaceAngle);
    const reflectPoint = pointTranslate(center, reflectAngle, incidenceLength);

    graphics.moveTo(dot1.x, dot1.y);
    graphics.lineTo(surfacePoint.x, surfacePoint.y);
    graphics.moveTo(dot2.x, dot2.y);
    graphics.lineTo(center.x, center.y);

    graphics.lineStyle(2, COLOR.pink);
    graphics.lineTo(reflectPoint.x, reflectPoint.y);
}

function createDot(x, y) {
    // create and draw a graphics object
    const dot = new PIXI.Graphics();
    dot.beginFill(COLOR.pink, 0.05);
    dot.drawCircle(0, 0, 30);
    dot.beginFill(COLOR.pink);
    dot.drawCircle(0, 0, 5);
    dot.position.set(x, y);
    // this will allow it to respond to mouse and touch events
    dot.interactive = true;
    // this button mode will mean the hand cursor appears
    dot.buttonMode = true;
    // listen to events
    dot.on('pointerdown', function () { this.alpha = 0.5; }) // prettier-ignore
        .on('pointerup', function () { this.alpha = 1; }) // prettier-ignore
        .on('pointerupoutside', function () { this.alpha = 1; }) // prettier-ignore

    return dot;
}

// translates a point by an angle in radians and distance
function pointTranslate(point, angle, distance) {
    return new PIXI.Point(
        point.x + distance * Math.cos(angle),
        point.y + distance * Math.sin(angle)
    );
}

// calculates the angle between 2 points, in radians
function angleBetween(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// calculates the distance between 2 points
function distanceBetween(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// Returns the angle of reflection given an angle of incidence and a surface angle.
function angleReflect(incidenceAngle, surfaceAngle) {
    return surfaceAngle * 2 - incidenceAngle;
}
