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

  // input - controls
  const controlsData = Object.assign({}, window.parent.controlsData);
  window.addEventListener('message', (event) => {
    const { type, key, value } = event.data;
    if (type !== 'sliderinput') return;
    controlsData[key] = value;
    draw();
  });

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  function draw() {
    const data = getData(
      controlsData.items,
      center.x,
      center.y,
      controlsData.radius,
      controlsData.segment * deg2rad,
    );

    graphics.clear();

    graphics.circle(center.x, center.y, 25);
    graphics.fill({ color: color.pink });

    graphics.moveTo(center.x, center.y);

    graphics.arc(
      center.x,
      center.y,
      controlsData.radius,
      data.startAngle,
      data.endAngle,
    );
    graphics.stroke({ width: 1, color: color.white });

    for (let i = 0; i < data.items.length; i++) {
      graphics.circle(data.items[i].x, data.items[i].y, 10);
    }
    graphics.fill({ color: color.white });
  }
  draw();

  function getData(items, x, y, radius, segment) {
    const theta = segment / (items - 1);

    const data = {
      startAngle: -Math.PI / 2 - segment / 2,
      endAngle: -Math.PI / 2 - segment / 2 + segment,
      items: [],
    };

    for (let i = 0; i < items; i++) {
      data.items.push({
        x: x + radius * Math.cos(data.startAngle + theta * i),
        y: y + radius * Math.sin(data.startAngle + theta * i),
      });
    }

    return data;
  }
})();
