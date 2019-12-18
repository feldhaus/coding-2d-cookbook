// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const MAXSPEED = 5;
const MAXFORCE = 0.2;

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

// runs an update loop
app.ticker.add(function(deltaTime) {
    if (app.renderer.plugins.interaction.mouseOverRenderer) {
        seek();
        update(deltaTime);
        vehicle.rotation = Math.atan2(velocity.y, velocity.x);
    }
});

const vehicle = new PIXI.Graphics();
app.stage.addChild(vehicle);
vehicle.position.set(400, 300);
vehicle.beginFill(COLOR.pink);
vehicle.drawPolygon(10, 0, -10, -8, -6, 0, -10, 8);

let velocity = new PIXI.Point();
let acceleration = new PIXI.Point();

function seek() {
    // mouse position
    const target = app.renderer.plugins.interaction.mouse.global;

    // a desired point from the position to the target
    let desired = new PIXI.Point(target.x - vehicle.x, target.y - vehicle.y);

    // scale to maximum speed
    desired = normalize(desired);
    desired.x *= MAXSPEED;
    desired.y *= MAXSPEED;

    // steering = desired minus velocity
    let steer = new PIXI.Point(desired.x - velocity.x, desired.y - velocity.y);

    // limit to maximum steering force
    steer = limit(steer, MAXFORCE);
    acceleration.x += steer.x;
    acceleration.y += steer.y;
}

function update(deltaTime) {
    // update velocity
    velocity.x += acceleration.x;
    velocity.y += acceleration.y;

    // limit speed
    velocity = limit(velocity, MAXSPEED);
    vehicle.x += velocity.x * deltaTime;
    vehicle.y += velocity.y * deltaTime;

    // reset accelerationelertion to 0 each cycle
    acceleration.x = 0;
    acceleration.y = 0;
}

function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

function magnitudeSqr(vector) {
    return vector.x * vector.x + vector.y * vector.y;
}

function normalize(vector) {
    let mag = magnitude(vector);
    if (mag > 0) {
        vector.x /= mag;
        vector.y /= mag;
    }
    return vector;
}

function limit(vector, max) {
    if (magnitudeSqr(vector) > max * max) {
        vector = normalize(vector);
        vector.x *= max;
        vector.y *= max;
    }
    return vector;
}
