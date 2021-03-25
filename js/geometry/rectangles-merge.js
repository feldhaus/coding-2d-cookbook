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
const center = new PIXI.Point(
  app.renderer.width * 0.5,
  app.renderer.height * 0.5
);

// add graphics
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// add shapes
const shapes = [
  createShape(100, 100, 100, 100),
  createShape(200, 100, 100, 100),
  createShape(300, 100, 100, 100),
  createShape(100, 200, 100, 100),
  createShape(200, 200, 100, 100),
  createShape(200, 300, 100, 100),
  createShape(100, 450, 100, 100),
  createShape(300, 300, 100, 100),
  createShape(400, 300, 100, 100),
  createShape(500, 300, 100, 100),
  createShape(500, 200, 100, 100),
  createShape(600, 200, 100, 100),
  createShape(650, 300, 100, 100),
];

function createShape(x, y, width, height) {
  const shape = new PIXI.Graphics();
  app.stage.addChild(shape);
  shape.position.set(x, y);
  shape.lineStyle(1, color.white);
  shape.beginFill(color.white, 0.05);
  shape.drawRect(0, 0, width, height);
  shape.closePath();
  shape.endFill();
  shape.interactive = true;
  shape.buttonMode = true;
  shape.dragOffset = new PIXI.Point();
  shape
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

  const x1 = shape.x;
  const y1 = shape.y;
  const x2 = shape.x + shape.width - 1;
  const y2 = shape.y + shape.height - 1;
  shape.shapePath = [].concat(x1, y1, x2, y1, x2, y2, x1, y2);

  return shape;
}

// drag functions
function onDragStart(event) {
  this.dragging = true;
  const position = event.data.getLocalPosition(this.parent);
  this.dragOffset.set(position.x - this.x, position.y - this.y);
}

function onDragEnd(event) {
  this.dragging = false;
}

function onDragMove(event) {
  if (!this.dragging) return;
  const position = event.data.getLocalPosition(this.parent);
  this.position.set(
    Math.round((position.x - this.dragOffset.x) / 10) * 10,
    Math.round((position.y - this.dragOffset.y) / 10) * 10
  );
  draw();
}

function draw() {
  graphics.clear();
  graphics.lineStyle(5, color.pink);
  const polygons = mergeRectangles();
  polygons.forEach((polygon) => {
    graphics.drawPolygon(polygon);
  });
}
draw();

function cmpX(a, b) {
  if (a.x < b.x || (a.x == b.x && a.y < b.y)) return -1;
  else if (a.x === b.x && a.y === b.y) return 0;
  else return 1;
}

function cmpY(a, b) {
  if (a.y < b.y || (a.y == b.y && a.x < b.x)) return -1;
  else if (a.x === b.x && a.y === b.y) return 0;
  else return 1;
}

function popitem(m, k) {
  if (!k) k = m.keys().next().value;
  const v = m.get(k);
  m.delete(k);
  return v;
}

function mergeRectangles() {
  const points = [];
  shapes.forEach((shape) => {
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + shape.width - 1;
    const y2 = shape.y + shape.height - 1;

    [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 },
      { x: x1, y: y2 },
    ].forEach((point) => {
      const index = points.findIndex((p) => p.x === point.x && p.y === point.y);
      if (index !== -1) {
        points.splice(index, 1);
      } else {
        points.push(point);
      }
    });
  });

  // sort points by lowest x, lowest y
  const sortX = points.concat();
  sortX.sort(cmpX);

  // sort points by lowest y, lowest x
  const sortY = points.concat();
  sortY.sort(cmpY);

  const edgesH = new Map();
  const edgesV = new Map();
  let i, curr;

  // go through each row and create edges between the vertices 2i and 2i + 1 in that row
  i = 0;
  while (i < points.length) {
    curr = sortX[i].x;
    while (i < points.length && sortX[i].x === curr) {
      edgesH.set(sortX[i], sortX[i + 1]);
      edgesH.set(sortX[i + 1], sortX[i]);
      i += 2;
    }
  }

  // go through each column and create edges between the vertices 2i and 2i + 1 in that column
  i = 0;
  while (i < points.length) {
    curr = sortY[i].y;
    while (i < points.length && sortY[i].y === curr) {
      edgesV.set(sortY[i], sortY[i + 1]);
      edgesV.set(sortY[i + 1], sortY[i]);
      i += 2;
    }
  }

  const polygons = [];

  while (edgesH.size > 0) {
    // can start from any point
    const items = [{ position: edgesH.keys().next().value, flag: 0 }];

    while (true) {
      const item = items[items.length - 1];

      if (item.flag === 0) {
        items.push({ position: popitem(edgesV, item.position), flag: 1 });
      } else {
        items.push({ position: popitem(edgesH, item.position), flag: 0 });
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (
        last.position.x === first.position.x &&
        last.position.y === first.position.y &&
        last.flag === first.flag
      ) {
        // close the polygon
        items.pop();
        break;
      }
    }

    const polygon = [];
    items.forEach((item) => {
      if (edgesH.has(item.position)) edgesH.delete(item.position);
      if (edgesV.has(item.position)) edgesV.delete(item.position);
      polygon.push(item.position.x, item.position.y);
    });
    polygons.push(polygon);
  }

  return polygons;
}
