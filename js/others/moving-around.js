// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const HANDLING = 0.07;
const RADIUS = 15;

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

// add vehicle
const vehicle = new PIXI.Graphics();
app.stage.addChild(vehicle);
vehicle.position.set(400, 300);
vehicle.beginFill(COLOR.pink);
vehicle.drawCircle(0, 0, RADIUS);
vehicle.direction = new PIXI.Point();

// add compass
const compass = new PIXI.Graphics();
app.stage.addChild(compass);
compass.position.set(400, 300);
compass.beginFill(COLOR.white);
compass.drawPolygon(5, 0, 0, -5, 0, 5);

// runs an update loop
app.ticker.add(function(deltaTime) {
    vehicle.rotation += HANDLING * vehicle.direction.x * deltaTime;
	vehicle.x += vehicle.direction.y * Math.cos(vehicle.rotation) * deltaTime;
	vehicle.y += vehicle.direction.y * Math.sin(vehicle.rotation) * deltaTime;
	vehicle.x = clamp(vehicle.x, RADIUS, 800 - RADIUS);
	vehicle.y = clamp(vehicle.y, RADIUS, 600 - RADIUS);
	
	compass.rotation += (vehicle.rotation - compass.rotation) * 0.1;
	compass.x = vehicle.x + Math.cos(compass.rotation) * (RADIUS + 5);
    compass.y = vehicle.y + Math.sin(compass.rotation) * (RADIUS + 5);
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// listen keydown event
document.onkeydown = (event) => {
	if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
		vehicle.direction.x = -1;
	} else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
		vehicle.direction.x = 1;
	}
	if (event.code === 'KeyS' || event.code === 'ArrowDown') {
		vehicle.direction.y = -1;
	} else if (event.code === 'KeyW' || event.code === 'ArrowUp') {
		vehicle.direction.y = 1;
	}
	event.preventDefault();
};

// listen keyup event
document.onkeyup = (event) => {
	if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
		vehicle.direction.x = 0;
	} else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
		vehicle.direction.x = 0;
	}
	if (event.code === 'KeyS' || event.code === 'ArrowDown') {
		vehicle.direction.y = 0;
	} else if (event.code === 'KeyW' || event.code === 'ArrowUp') {
		vehicle.direction.y = 0;
	}
	event.preventDefault();
};