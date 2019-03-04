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
const RADIUS1 = 150;
const RADIUS2 = 100;

// create application
const app = new PIXI.Application(WIDTH, HEIGHT, {
    backgroundColor: COLOR.gunmetal,
    antialias: true
});
document.body.appendChild(app.view);

// add tip
const tip = new PIXI.Text(
    'DRAG and DROP the circles:',
    FONTSTYLE
);
app.stage.addChild(tip);
tip.position.set(5, 5);

// add circle 1
const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.lineStyle(1, COLOR.isabelline);
circle1.beginFill(0, 0.01)
circle1.drawCircle(0, 0, RADIUS1);
circle1.position.set(WIDTH / 2 - 100, HEIGHT / 2);
circle1.r = RADIUS1; // store radius
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
circle2.lineStyle(1, COLOR.isabelline);
circle2.beginFill(0, 0.01)
circle2.drawCircle(0, 0, RADIUS2);
circle2.position.set(WIDTH / 2 + 100, HEIGHT / 2);
circle2.r = RADIUS2; // store radius
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
rect1.tint = COLOR.darkpink;

// add rect 2
const rect2 = new PIXI.Sprite(PIXI.Texture.WHITE);
app.stage.addChild(rect2);
rect2.anchor.set(0.5, 0.5);
rect2.tint = COLOR.darkpink;

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
        calcCircleIntersection();
    }
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
