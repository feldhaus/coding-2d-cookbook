// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true,
});
document.body.appendChild(app.view);

// add background
const background = new PIXI.Sprite();
app.stage.addChild(background);
background.anchor.set(0.5);
background.position.set(app.renderer.width * 0.5, app.renderer.height * 0.5);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
graphics.lineStyle(3, 0xffffff);
graphics.drawRect(-200, -150, 400, 300);
graphics.position.set(app.renderer.width * 0.5, app.renderer.height * 0.5);

// load image
PIXI.Loader.shared
    .add('background', './assets/images/background.jpg')
    .load(onLoaded);

// listen pointer down event
app.renderer.plugins.interaction.on('pointerdown', switchScaleMode);

function onLoaded() {
    background.texture = PIXI.Texture.from('background');

    switchScaleMode();
}

let flag = true;

function switchScaleMode() {
    background.scale.set(1);
    let scale = 1;
    if (flag) {
        scale = scaleNoBorder(
            background.width,
            background.height,
            graphics.width,
            graphics.height
        );
    } else {
        scale = scaleShowAll(
            background.width,
            background.height,
            graphics.width,
            graphics.height
        );
    }
    background.scale.set(scale);
    flag = !flag;
}

// the entire image fill the specified area
function scaleNoBorder(imgWidth, imgHeight, targetWidth, targetHeight) {
    return Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
}

// the entire image be visible in the specified area and borders can appear on two sides
function scaleShowAll(imgWidth, imgHeight, targetWidth, targetHeight) {
    return Math.min(targetWidth / imgWidth, targetHeight / imgHeight);
}
