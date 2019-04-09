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

// add the graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// store clicked points
const points = [];

// listen pointer down event
app.renderer.plugins.interaction.on('pointerdown', addPoint);

// draw a sample shape (star)
graphics.lineStyle(5, COLOR.pink);
const shape1 = [
    new PIXI.Point(200, 100),
    new PIXI.Point(220, 150),
    new PIXI.Point(280, 150),
    new PIXI.Point(230, 190),
    new PIXI.Point(250, 250),
    new PIXI.Point(200, 220),
    new PIXI.Point(150, 250),
    new PIXI.Point(170, 190),
    new PIXI.Point(120, 150),
    new PIXI.Point(180, 150)
];
drawRoundedPolygon(shape1, 10);

// draw a sample shape (rect)
const shape2 = [
    new PIXI.Point(400, 200),
    new PIXI.Point(600, 200),
    new PIXI.Point(600, 400),
    new PIXI.Point(400, 400)
];
drawRoundedPolygon(shape2, 30);

// add a new point
function addPoint (event) {
    points.push(new PIXI.Point(
        event.data.global.x,
        event.data.global.y)
    );
    
    if (points.length > 2) {
        graphics.clear();
        
        graphics.lineStyle(1, COLOR.white, 0.5);
        graphics.drawPolygon(points.concat(points[0]));

        graphics.lineStyle(5, COLOR.pink);
        drawRoundedPolygon(
            straightSkeleton(points, 20),
            20
        );

        graphics.endFill();
    }
    graphics.lineStyle(1, COLOR.white, 1);
    graphics.beginFill(COLOR.white);
    graphics.drawCircle(event.data.global.x, event.data.global.y, 2);
    graphics.endFill();
}

function drawRoundedPolygon (path, radius) {
    let first;
    const len = path.length;
    for (let i = 0; i < len; i++) {
        // get the current point and the next two
        const p1 = path[i];
        const p2 = path[(i + 1) % len];
        const p3 = path[(i + 2) % len];
        
        // vector 1
        const dx1 = p2.x - p1.x;
        const dy1 = p2.y - p1.y;

        // vector 2
        const dx2 = p2.x - p3.x;
        const dy2 = p2.y - p3.y;
        
        // angle between vector 1 and vector 2 divided by 2
        const angle = (Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)) / 2;

        // the length of segment between angular point and the
        // points of intersection with the circle of a given radius
        const tan = Math.abs(Math.tan(angle));
        const seg = radius / tan;

        // check the segment
        const len1 = getLength(dx1, dy1);
        const len2 = getLength(dx2, dy2);
        
        // points of intersection are calculated by the proportion
        // between the coordinates of the vector, length of vector and
        // the length of the segment
        const cross1 = getProportionPoint(p2, seg, len1, dx1, dy1);
        const cross2 = getProportionPoint(p2, seg, len2, dx2, dy2);

        // calculation of the coordinates of the circle 
        // center by the addition of angular vectors
        const dx = p2.x * 2 - cross1.x - cross2.x;
        const dy = p2.y * 2 - cross1.y - cross2.y;

        const L = getLength(dx, dy);
        const d = getLength(seg, radius);

        // center radius
        const cx = getProportionPoint(p2, d, L, dx, dy);

        // start and end angle of arc
        const startAngle = Math.atan2(cross1.y - cx.y, cross1.x - cx.x);
        const endAngle = Math.atan2(cross2.y - cx.y, cross2.x - cx.x);
        
        // get clock wise direction to draw the arc
        let sweepAngle = endAngle - startAngle;
        if (sweepAngle < -Math.PI) {
            sweepAngle = Math.PI * 2 + sweepAngle;
        } else if (sweepAngle > Math.PI) {
            sweepAngle = sweepAngle - Math.PI * 2;
        }
        const anticlockwise = sweepAngle < 0 || sweepAngle > Math.PI;

        if (i === 0) {
            graphics.moveTo(cross1.x, cross1.y);
            first = cross1
        } else {
            graphics.lineTo(cross1.x, cross1.y);
        }
                        
        // draw the arc to connect the next vector
        graphics.arc(cx.x, cx.y, radius, startAngle, endAngle, anticlockwise);
    }
    
    // close the path
    graphics.lineTo(first.x, first.y);
}

function getLength(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
}

function getProportionPoint(point, segment, length, dx, dy) {
    const factor = segment / length;
    return new PIXI.Point(point.x - dx * factor, point.y - dy * factor);
}

function straightSkeleton(path, spacing) {
    const order = polygonOrder(path);
    if (order < 0) { spacing *= -1; }
    
    const resultingPath = [];
    const len = path.length;

    for (let i = 0; i < len; i++) {
        const p0 = path[(i) % len];
        const p1 = path[(i+1) % len];
        const p2 = path[(i+2) % len];
        
        const a0 = new PIXI.Point(p1.x - p0.x, p1.y - p0.y);
        const a1 = new PIXI.Point(p2.x - p1.x, p2.y - p1.y);
        
        const mi0 = a0.y / a0.x;
        const mi1 = a1.y / a1.x;
        
        const li0 = Math.sqrt(a0.x * a0.x + a0.y * a0.y);
        const li1 = Math.sqrt(a1.x * a1.x + a1.y * a1.y);
        
        const ri0 = p0.x + spacing * a0.y / li0;
        const ri1 = p1.x + spacing * a1.y / li1;
        
        const si0 = p0.y - spacing * a0.x / li0;
        const si1 = p1.y - spacing * a1.x / li1;
        
        const point = new PIXI.Point(
            (mi1 * ri1 - mi0 * ri0 + si0 - si1) / (mi1 - mi0),
            (mi0 * mi1 * (ri1 - ri0) + mi1 * si0 - mi0 * si1) / (mi1 - mi0)
        );
        
        if (a0.x === 0) {
            point.x = p1.x + spacing * a0.y / Math.abs(a0.y);
            point.y = mi1 * point.x - mi1 * ri1 + si1;
        }
        
        if (a1.x === 0) {
            point.x = p2.x + spacing * a1.y / Math.abs(a1.y);
            point.y = mi0 * point.x - mi0 * ri0 + si0;
        }
        
        resultingPath.push(point);
    }
    
    return resultingPath;
}

function polygonOrder(path) {
    let signedArea = 0;
    const len = path.length;
    for (let i = 0; i < len; i++) {
        p0 = path[i];
        p1 = path[(i+1) % len];
        signedArea += (p0.x * p1.y - p1.x * p0.y)
    }
    return signedArea
}
