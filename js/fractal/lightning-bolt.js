// create application
const app = new PIXI.Application({
  backgroundColor: 0x21252f,
  antialias: true,
  width: 800,
  height: 600,
});
document.body.appendChild(app.view);

// constants
const color = { pink: 0xec407a, white: 0xf2f5ea };

// add tree graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
graphics.lineStyle(2, color.white);

// listen pointer down event
app.renderer.plugins.interaction.on('pointerdown', lightning);

function lightning(event) {
  drawLightning(event.data.global.x, 0, 20, 3, false);
}

function drawLightning(x, y, segments, boltWidth, branch) {
  const width = app.renderer.width;
  const height = app.renderer.height;

  if (!branch) graphics.clear();

  // draw each of the segments
  for (let i = 0; i < segments; i++) {
    // set the lightning color and bolt width
    graphics.lineStyle(boltWidth, 0xffffff);
    graphics.moveTo(x, y);

    // calculate an x offset from the end of the last line segment and keep it
    // within the bounds of the renderer
    if (branch) {
      x += rangeInt(-10, 10);
    } else {
      x += rangeInt(-30, 30);
    }

    if (x <= 10) x = 10;
    if (x >= width - 10) x = width - 10;

    // calculate a y offset from the end of the last line segment
    if (branch) {
      // if it reaches the ground so don't set the last coordinate to the
      // ground if it's hanging in the air
      y += rangeInt(10, 20);
    } else {
      y += rangeInt(20, height / segments);
    }

    // when it's reached the ground or there are no more segments left,
    // set the y position to the height
    if ((!branch && i == segments - 1) || y > height) {
      y = height;
    }

    // draw the line segment
    graphics.lineTo(x, y);

    // quit when it reached the ground
    if (y >= height) break;

    // draw a branch, thinner, bolt starting from this position
    if (!branch && Math.random() < 0.4) {
      drawLightning(x, y, 10, 1, true);
    }
  }
}

function rangeInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
