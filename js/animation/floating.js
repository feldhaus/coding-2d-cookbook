// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

const circle1 = new PIXI.Graphics();
app.stage.addChild(circle1);
circle1.beginFill(COLOR.pink);
circle1.drawCircle(0, 0, 50);
circle1.position.set(app.renderer.width * 0.25, app.renderer.height * 0.50);

const circle2 = new PIXI.Graphics();
app.stage.addChild(circle2);
circle2.beginFill(COLOR.pink);
circle2.drawCircle(0, 0, 50);
circle2.position.set(app.renderer.width * 0.50, app.renderer.height * 0.50);

const circle3 = new PIXI.Graphics();
app.stage.addChild(circle3);
circle3.beginFill(COLOR.pink);
circle3.drawCircle(0, 0, 50);
circle3.position.set(app.renderer.width * 0.75, app.renderer.height * 0.50);

// runs an update loop
app.ticker.add(function(deltaTime) {
    const cy = app.renderer.height * 0.50;
    const time = new Date().getTime();
    circle1.y = cy + (Math.cos(time * 0.002) * 80);
    circle2.y = cy + (Math.cos(time * 0.004) * 50);
    circle3.y = cy + (Math.cos(time * 0.008) * 100);
});

