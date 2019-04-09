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

// map coordinates
const mapCoords = [
    [
        45,106, 45,194, 12,194, 12,222, 22,222, 22,267, 12,267, 12,424, 35,447,
        108,447, 108,450, 129,450, 129,438, 144,438, 144,443, 227,443, 227,438,
        241,438, 241,486, 295,486, 295,479, 307,479, 307,491, 387,491, 387,474,
        433,474, 433,491, 453,491, 456,495, 476,481, 476,300, 466,300, 466,273,
        470,269, 479,269, 479,273, 500,273, 500,269, 514,269, 514,273, 530,273,
        530,269, 540,269, 546,273, 592,273, 592,260, 616,260, 616,273, 613,277,
        613,346, 786,346, 786,205, 687,205, 687,286, 641,286, 641,220, 616,220,
        616,232, 592,232, 592,212, 568,212, 568,144, 491,144, 491,214, 472,214,
        472,154, 395,154, 395,146, 376,146, 376,154, 362,154, 362,146, 343,146,
        343,154, 328,154, 328,146, 310,146, 310,154, 224,154, 224,176, 212,176,
        212,106, 45,106
    ],
    [
        104,194, 104,340, 129,363, 129,404, 144,404, 144,398, 227,398, 227,404,
        241,404, 241,398, 260,398, 260,394, 250,394, 250,382, 224,382, 224,340,
        212,340, 212,356, 158,356, 146,335, 146,238, 160,238, 160,209, 143,209,
        143,194, 104,194
    ],
    [
        192,209, 192,238, 212,238, 212,270, 241,270, 241,257, 224,257, 224,200,
        212,200, 212,209, 192,209
    ],
    [
        270,200, 270,257, 260,257, 260,270, 294,270, 294,302, 435,302, 435,273,
        422,260, 422,214, 454,214, 454,198, 446,198, 446,206, 416,206, 416,198,
        412,198, 412,190, 294,190, 294,200, 270,200
    ],
    [
        244,340, 244,356, 278,356, 278,394, 295,394, 295,442, 309,442, 309,428,
        317,428, 317,412, 309,412, 309,387, 317,387, 317,372, 309,372, 309,352,
        260,352, 260,340, 244,340
    ]
];

// add graphics
const graphics = new PIXI.Graphics();
graphics.lineStyle(1, COLOR.white);
graphics.beginFill(COLOR.white, 0.05);
for (let i = 0; i < mapCoords.length; i++) {
    graphics.drawPolygon(mapCoords[i]);
}
app.stage.addChild(graphics);

// add player
const player = new PIXI.Sprite(PIXI.Texture.WHITE);
player.tint = COLOR.pink;
player.anchor.set(0.5, 0.5);
player.position.set(50, 300);
player.direction = new PIXI.Point(0, 0);
app.stage.addChild(player);

// add feedback graphics (to draw the raycast)
const feedback = new PIXI.Graphics();
app.stage.addChild(feedback);

// runs an update loop
app.ticker.add(function(deltaTime) { update(deltaTime); });

// listen keydown event
document.onkeydown = function (event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        player.direction.x = -1;
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        player.direction.x = 1;
    }

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        player.direction.y = -1;
    } else if (event.code === 'ArrowDow' || event.code === 'KeyS') {
        player.direction.y = 1;
    }

    event.preventDefault();
}

// listen keyup event
document.onkeyup = function (event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        player.direction.x = 0;
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        player.direction.x = 0;
    }

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        player.direction.y = 0;
    } else if (event.code === 'ArrowDow' || event.code === 'KeyS') {
        player.direction.y = 0;
    }

    event.preventDefault();
}

function update(deltaTime) {
    player.x += player.direction.x * 1.5 * deltaTime;
    player.y += player.direction.y * 1.5 * deltaTime;
    raycastLinear();
}

function raycastLinear() {
    // find closest intersection
    const closestIntersect = findClosestIntersection(
        player.position,
        app.renderer.plugins.interaction.mouse.global // mouse position
    );
    
    feedback.clear();

    // there is an intersect
    if (closestIntersect != null) {
        feedback.lineStyle(2, COLOR.pink);
        feedback.drawCircle(closestIntersect.x, closestIntersect.y, 3);
        feedback.moveTo(player.x, player.y);
        feedback.lineTo(closestIntersect.x, closestIntersect.y);
    }
}

// returns a closest intersection 
function findClosestIntersection(origin, direction) {
    let closestIntersect = null;

    const ray = { a: origin, b: direction };
    
    // see intersection between all the map segments
    for (let i = 0; i < mapCoords.length; i++) {
        for (let j = 0; j < mapCoords[i].length-2; j+=2) {
            const seg = {
                a: new PIXI.Point(mapCoords[i][j+0], mapCoords[i][j+1]),
                b: new PIXI.Point(mapCoords[i][j+2], mapCoords[i][j+3])
            };
            
            // get intersection
            const intersection = getIntersection(ray, seg);
            
            // there is not intersection, continue
            if (!intersection) { continue };
            
            // it's nearest, save it
            if (!closestIntersect || intersection.distance < closestIntersect.distance) {
                closestIntersect = intersection;
            }
        }
    }
    
    return closestIntersect;
}

// returns an intersect between raycast and a segment
function getIntersection(ray, seg) {
    const u = new PIXI.Point(ray.b.x - ray.a.x, ray.b.y - ray.a.y);
    const v = new PIXI.Point(seg.b.x - seg.a.x, seg.b.y - seg.a.y);
    const w = new PIXI.Point(ray.a.x - seg.a.x, ray.a.y - seg.a.y);
    const s = new PIXI.Point(seg.a.x - ray.a.x, seg.a.y - ray.a.y);

    const d1 = (u.x * s.y + u.y * w.x) / (v.x * u.y - v.y * u.x);
    const d2 = (seg.a.x + v.x * d1 - ray.a.x) / u.x;

    // must be within parametic whatevers for ray / segment
    if (d1 < 0 || d1 > 1) return;
    if (d2 < 0) return;

    // return the point of intersection
    return {
        x: ray.a.x + u.x * d2,
        y: ray.a.y + u.y * d2,
        distance: d2
    };
}
