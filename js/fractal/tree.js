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
  const deg2rad = Math.PI / 180;
  const duration = 100;
  const branches = 10;

  // add tree graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  // add tree fill animation graphics
  const animation = new PIXI.Graphics();
  app.stage.addChild(animation);

  // runs an update loop
  let elapsedTime = 0;
  app.ticker.add(update);

  let array = [];
  drawTree(center.x, app.renderer.height, -90, branches);
  graphics.stroke({ width: 2, color: color.white });
  array.reverse();

  function drawTree(x1, y1, angle, depth) {
    if (depth > 0) {
      const x2 = x1 + Math.cos(angle * deg2rad) * depth * 10;
      const y2 = y1 + Math.sin(angle * deg2rad) * depth * 10;

      const p1 = new PIXI.Point(x1, y1);
      const p2 = new PIXI.Point(x2, y2);

      if (array[depth - 1]) {
        array[depth - 1].push({ p1: p1, p2: p2 });
      } else {
        array[depth - 1] = [{ p1: p1, p2: p2 }];
      }

      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);

      drawTree(x2, y2, angle - Math.random() * 15 - 15, depth - 1);
      drawTree(x2, y2, angle + Math.random() * 15 + 15, depth - 1);
    }
  }

  function update({ elapsedMS }) {
    elapsedTime += elapsedMS;
    const t = (elapsedTime % duration) / duration;
    const ix = Math.floor(elapsedTime / duration);
    if (ix < branches) {
      animation.clear();
      for (let i = 0; i < ix + 1; i++) {
        for (let j = 0; j < array[i].length; j++) {
          const p1 = array[i][j].p1;
          const p2 = array[i][j].p2;
          if (i === ix) {
            animation.moveTo(p1.x, p1.y);
            animation.lineTo(lerp(p1.x, p2.x, t), lerp(p1.y, p2.y, t));
          } else {
            animation.moveTo(p1.x, p1.y);
            animation.lineTo(p2.x, p2.y);
            animation.circle(p2.x, p2.y, 2);
          }
        }
      }
      animation.stroke({ width: 2, color: color.pink });
    }
  }

  function lerp(start, end, threshold) {
    return start + (end - start) * threshold;
  }
})();
