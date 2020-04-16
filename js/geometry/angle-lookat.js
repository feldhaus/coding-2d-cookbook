// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };

// create application
const app = new PIXI.Application({
  backgroundColor: COLOR.grey,
  antialias: true,
});
document.body.appendChild(app.view);

const center = new PIXI.Point(
  app.renderer.width * 0.5,
  app.renderer.height * 0.5
);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
graphics.position.set(center.x, center.y);
graphics.beginFill(COLOR.pink);
graphics.drawPolygon(50, 0, -50, -40, -30, 0, -50, 40);

// listen pointer move event
app.renderer.plugins.interaction.on('pointermove', (event) => {
  graphics.rotation = angleBetween(graphics, event.data.global);
});

// calculates the angle between 2 points, in radians
function angleBetween(p0, p1) {
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}
