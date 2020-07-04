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

// add graphics
const map = new PIXI.Graphics();
app.stage.addChild(map);

const feedback = new PIXI.Graphics();
app.stage.addChild(feedback);

// add state name
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
  map.lineStyle(2, color.white);
  map.beginFill(color.white, 0.05);
  Object.keys(data).forEach((state) => {
    data[state].forEach((path) => {
      map.drawPolygon(path);
      map.closePath();
    });
  });
}

// listen pointer move event
app.renderer.plugins.interaction.on('pointermove', onPointerMove);

function onPointerMove(event) {
  // search if mouse position is over some state polygon
  let overState;
  Object.keys(mapData).forEach((state) => {
    if (
      mapData[state].some((path) =>
        contains(event.data.global.x, event.data.global.y, path)
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
      feedback.lineStyle(4, color.pink);
      feedback.beginFill(color.pink, 0.05);
      feedback.drawPolygon(path);
      feedback.closePath();
    });
  } else {
    stateName.text = '';
  }
}

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
