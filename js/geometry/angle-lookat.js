// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true
});
document.body.appendChild(app.view);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
graphics.position.set(400, 300);
graphics.beginFill(COLOR.pink);
graphics.drawPolygon(50, 0, -50, -40, -30, 0, -50, 40);

// listen pointer move event
app.renderer.plugins.interaction.on('pointermove', onPointerMove);

function onPointerMove(event) {
    graphics.rotation = Math.atan2(
        event.data.global.y - graphics.y,
        event.data.global.x - graphics.x
    );
}
