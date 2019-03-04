// constants
const WIDTH = 800;
const HEIGHT = 600;
const COLOR = {
    gunmetal: 0x2C363F,
    darkpink: 0xd81b60,// 0xE75A7C,
    isabelline: 0xF2F5EA,
    timberwolf: 0xD6DBD2,
    darkvanilla: 0xBBC7A4,
};
const FONTSTYLE = {
    fontSize: 14,
    fontFamily: "\"Courier New\", Courier, monospace",
    fill: COLOR.timberwolf,
};
const DEG2RAD = Math.PI / 180;
const DURATION = 100;
const DEPTH = 10;

// create application
const app = new PIXI.Application(WIDTH, HEIGHT, {
    backgroundColor: COLOR.gunmetal,
    antialias: true
});
document.body.appendChild(app.view);

// add tip
const tip = new PIXI.Text(
    '---',
    FONTSTYLE
);
app.stage.addChild(tip);
tip.position.set(5, 5);

let array = new Array(DEPTH);

// draw the tree
const tree = new PIXI.Graphics();
app.stage.addChild(tree);
tree.lineStyle(2, COLOR.isabelline);

// draw fill animation
const animation = new PIXI.Graphics();
app.stage.addChild(animation);

app.ticker.add(function(deltaTime) { update(deltaTime); });

// drawTree(WIDTH / 2, HEIGHT, -90, DEPTH);
// array.reverse();
let elapsedTime = 0;
abc();

function abc () {
    elapsedTime = 0;
    
    tree.clear();
    tree.lineStyle(2, COLOR.isabelline);
    animation.clear();

    array = []
    drawTree(WIDTH / 2, HEIGHT, -90, DEPTH);
    array.reverse();
}

function drawTree (x1, y1, angle, depth) {
    if (depth > 0) {
        const x2 = x1 + (Math.cos(angle * DEG2RAD) * depth * 10);
        const y2 = y1 + (Math.sin(angle * DEG2RAD) * depth * 10);

        const p1 = new PIXI.Point(x1, y1);
        const p2 = new PIXI.Point(x2, y2);

        if (array[depth - 1]) {
            array[depth - 1].push({p1: p1, p2: p2});
        } else {
            array[depth - 1] = [{p1: p1, p2: p2}];
        }

        tree.moveTo(x1, y1);
        tree.lineTo(x2, y2);

        drawTree(x2, y2, angle - Math.random() * 15 - 15, depth - 1);
        drawTree(x2, y2, angle + Math.random() * 15 + 15, depth - 1);
    }
}

function update (deltaTime) {
    elapsedTime += deltaTime;
    const t = (elapsedTime % DURATION) / DURATION;
    const ix = Math.floor(elapsedTime / DURATION);
    if (ix < DEPTH) {
        animation.clear();
        animation.lineStyle(2, COLOR.darkpink, 1);
        for (let i = 0; i < ix + 1; i++) {
            for (let j = 0; j < array[i].length; j++) {
                const p1 = array[i][j].p1;
                const p2 = array[i][j].p2;
                if (i === ix) {
                    animation.moveTo(p1.x, p1.y);
                    animation.lineTo(
                        lerp(p1.x, p2.x, t),
                        lerp(p1.y, p2.y, t)
                    );
                } else {
                    animation.moveTo(p1.x, p1.y);
                    animation.lineTo(p2.x, p2.y);
                    animation.drawCircle(p2.x, p2.y, 2);
                }
            }
        }
    }
}

function lerp (a, b, t) {
    return a + (b - a) * t;
}
