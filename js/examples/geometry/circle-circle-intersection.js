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

// add circles
const center = new PIXI.Point(app.renderer.width / 2, app.renderer.height / 2);
const circle1 = createCircle(center.x - 100, center.y, 150);
const circle2 = createCircle(center.x + 100, center.y, 100);

function createCircle(x, y, radius) {
    const circle = new PIXI.Graphics();
    app.stage.addChild(circle);
    circle.position.set(x, y);
    circle.r = radius;
    circle.beginFill(COLOR.white, 0.05);
    circle.drawCircle(0, 0, circle.r + 20);
    circle.beginFill(0, 0);
    circle.lineStyle(3, COLOR.white);
    circle.drawCircle(0, 0, circle.r);
    circle.interactive = true;
    circle.buttonMode = true;
    circle.dragOffset = new PIXI.Point();
    circle
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);
    return circle;
}

// add rect 1
const rect1 = new PIXI.Sprite(PIXI.Texture.WHITE);
app.stage.addChild(rect1);
rect1.anchor.set(0.5, 0.5);
rect1.tint = COLOR.pink;

// add rect 2
const rect2 = new PIXI.Sprite(PIXI.Texture.WHITE);
app.stage.addChild(rect2);
rect2.anchor.set(0.5, 0.5);
rect2.tint = COLOR.pink;

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
    circleIntersection();
}

// first call
circleIntersection();

function circleIntersection() {
    const x1 = circle1.x, y1 = circle1.y, r1 = circle1.r;
    const x2 = circle2.x, y2 = circle2.y, r2 = circle2.r;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx**2 + dy**2);

    if (d > r1 + r2) {
        // no intersect
        rect1.visible = false;
        rect2.visible = false;
    } else if (d < Math.abs(r2 - r1)) {
        // no intersect - one circle is contained within the other
        rect1.visible = false;
        rect2.visible = false;
    } else if (d === 0 && r1 === r2) {
        // no intersect - the circles are equal and coincident
        rect1.visible = false;
        rect2.visible = false;
    } else {
        rect1.visible = true;
        rect2.visible = true;

        const a = (r1**2 - r2**2 + d**2) / (2 * d);
        const h = Math.sqrt(r1**2 - a**2);
        const x = x1 + (a * dx) / d;
        const y = y1 + (a * dy) / d;

        rect1.x = x + (h * dy) / d;
        rect1.y = y - (h * dx) / d;

        rect2.x = x - (h * dy) / d;
        rect2.y = y + (h * dx) / d;
    }
}
