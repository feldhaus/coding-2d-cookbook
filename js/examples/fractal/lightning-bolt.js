// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

// add tree graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
graphics.lineStyle(2, COLOR.isabelline);

// listen pointer down event
app.renderer.plugins.interaction.on('pointerdown', lightning);

function lightning(event) {
    drawLightning(event.data.global.x, 0, 20, 3, false);
}

function drawLightning(x, y, segments, boltWidth, branch) {
    let width = app.renderer.width;
    let height = app.renderer.height;

    if (!branch) graphics.clear();

    // Draw each of the segments
    for (let i = 0; i < segments; i++) {
        // Set the lightning color and bolt width
        graphics.lineStyle(boltWidth, 0xffffff);
        graphics.moveTo(x, y);

        // Calculate an x offset from the end of the last line segment and
        // keep it within the bounds of the bitmap
        if (branch) {
            x += integerInRange(-10, 10); // For a branch
        } else {
            x += integerInRange(-30, 30); // For the main bolt
        }

        if (x <= 10) x = 10;
        if (x >= width - 10) x = width - 10;

        // Calculate a y offset from the end of the last line segment.
        // When we've reached the ground or there are no more segments left,
        // set the y position to the height of the bitmap. For branches, we
        // don't care if they reach the ground so don't set the last coordinate
        // to the ground if it's hanging in the air.
        if (branch) {
            y += integerInRange(10, 20); // For a branch
        } else {
            y += integerInRange(20, height / segments); // For the main bolt
        }
        if ((!branch && i == segments - 1) || y > height) {
            y = height;
        }

        // Draw the line segment
        graphics.lineTo(x, y);

        // Quit when it reached the ground
        if (y >= height) break;

        // Draw a branch, thinner, bolt starting from this position
        if (!branch && Math.random() < 0.4) {
            drawLightning(x, y, 10, 1, true);
        }
    }
}

function integerInRange(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
