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

// add circle 1
const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.position.set(app.renderer.width / 2 - 100, app.renderer.height / 2);
circle1.r = 150;
circle1.lineStyle(3, COLOR.white);
circle1.beginFill(0, 0);
circle1.drawCircle(0, 0, circle1.r);
circle1.interactive = true;
circle1.buttonMode = true;
circle1.dragOffset = new PIXI.Point();
circle1
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

// add circle 2
const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.position.set(app.renderer.width / 2 + 100, app.renderer.height / 2);
circle2.r = 100;
circle2.lineStyle(3, COLOR.white);
circle2.beginFill(0, 0);
circle2.drawCircle(0, 0, circle2.r);
circle2.interactive = true;
circle2.buttonMode = true;
circle2.dragOffset = new PIXI.Point();
circle2
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

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
function onDragStart (event) {
    this.dragging = true;
    const position = event.data.getLocalPosition(this.parent);
    this.dragOffset.set(position.x - this.x, position.y - this.y);
}

function onDragEnd (event) {
    this.dragging = false;
}

function onDragMove (event) {
    if (!this.dragging) return;
    const position = event.data.getLocalPosition(this.parent);
    this.position.set(
        position.x - this.dragOffset.x,
        position.y - this.dragOffset.y
    );
    calcCircleIntersection();
}

// circle-circle-intersection
function calcCircleIntersection () {
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

calcCircleIntersection();
