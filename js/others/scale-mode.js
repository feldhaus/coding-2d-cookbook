(async () => {
  // create application
  const app = new PIXI.Application();
  await app.init({
    backgroundColor: 0x21252f,
    antialias: true,
    width: 800,
    height: 600,
  });
  document.body.appendChild(app.canvas);

  // constants
  const color = { pink: 0xec407a, white: 0xf2f5ea };
  const center = new PIXI.Point(
    app.renderer.width * 0.5,
    app.renderer.height * 0.5,
  );

  const texture = await PIXI.Assets.load('./background.jpg');

  // add background
  const background = new PIXI.Sprite({ texture });
  app.stage.addChild(background);
  background.anchor.set(0.5);
  background.position.copyFrom(center);

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);
  graphics.rect(-350, -150, 700, 300);
  graphics.stroke({ width: 3, color: color.white });
  graphics.position.copyFrom(center);

  // listen pointer down event
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', switchScaleMode);

  let flag = true;

  switchScaleMode();

  function switchScaleMode() {
    background.scale.set(1);
    let scale = 1;
    if (flag) {
      scale = scaleNoBorder(
        background.width,
        background.height,
        graphics.width,
        graphics.height,
      );
    } else {
      scale = scaleShowAll(
        background.width,
        background.height,
        graphics.width,
        graphics.height,
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
})();
