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
  const offsetY = 50;

  // add graphics
  const map = new PIXI.Graphics();
  app.stage.addChild(map);
  map.y = offsetY;

  const feedback = new PIXI.Graphics();
  app.stage.addChild(feedback);
  feedback.y = offsetY;

  const stateName = new PIXI.Text('', {
    fill: color.pink,
    fontSize: 24,
  });
  stateName.anchor.set(0, 1);
  stateName.position.set(10, 590);
  app.stage.addChild(stateName);

  // fetch json map data
  let mapData = {};
  fetch('./assets/json/usa-map.json')
    .then((res) => res.json())
    .then((data) => drawMap(data));

  function drawMap(data) {
    mapData = data;
    Object.keys(data).forEach((state) => {
      data[state].forEach((path) => {
        map.poly(path);
      });
    });
    map.stroke({ width: 2, color: color.white });
    map.fill({ color: color.white, alpha: 0.05 });
  }

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    // search if mouse position is over some state polygon
    let overState;
    Object.keys(mapData).forEach((state) => {
      if (
        mapData[state].some((path) =>
          contains(event.data.global.x, event.data.global.y - offsetY, path),
        )
      ) {
        overState = state;
        return;
      }
    });

    // show the feedback
    feedback.clear();
    if (overState) {
      stateName.text = overState;
      mapData[overState].forEach((path) => {
        feedback.poly(path);
        feedback.stroke({ width: 4, color: color.pink });
        feedback.fill({ color: color.pink, alpha: 0.05 });
      });
    } else {
      stateName.text = '';
    }
  });

  function contains(x, y, polygon) {
    let inside = false;
    const length = polygon.length / 2;
    for (let i = 0, j = length - 1; i < length; j = i++) {
      const xi = polygon[i * 2];
      const yi = polygon[i * 2 + 1];
      const xj = polygon[j * 2];
      const yj = polygon[j * 2 + 1];
      const intersect =
        yi > y !== yj > y && x < (xj - xi) * ((y - yi) / (yj - yi)) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }
})();
