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

  // add graphics
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

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
    shape.drawRect(0, 0, width, height);
    shape.stroke({ width: 1, color: color.white });
    shape.fill({ color: color.white, alpha: 0.05 });
    shape.closePath();
    shape.endFill();
    shape.eventMode = 'dynamic';
    shape.cursor = 'pointer';
    shape.offset = new PIXI.Point();
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + shape.width - 1;
    const y2 = shape.y + shape.height - 1;
    shape.shapePath = [].concat(x1, y1, x2, y1, x2, y2, x1, y2);
    return shape;
  }

  // listen to pointer events
  let dragging = null;
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    if (dragging === null) return;

    dragging.position.set(
      Math.round((event.data.global.x - dragging.offset.x) / 10) * 10,
      Math.round((event.data.global.y - dragging.offset.y) / 10) * 10,
    );

    draw();
  });

  shapes.forEach((item) => {
    item.on('pointerdown', (event) => {
      dragging = item;
      item.alpha = 0.5;
      item.offset.set(
        event.data.global.x - item.x,
        event.data.global.y - item.y,
      );
    });
    item.on('pointerup', () => {
      dragging = null;
      item.alpha = 1;
    });
    item.on('pointerupoutside', () => {
      dragging = null;
      item.alpha = 1;
    });
  });

  function draw() {
    graphics.clear();
    const polygons = mergeRectangles();
    polygons.forEach((polygon) => {
      graphics.poly(polygon);
    });
    graphics.stroke({ width: 5, color: color.pink });
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
        const index = points.findIndex(
          (p) => p.x === point.x && p.y === point.y,
        );
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

    // go through each row and create edges between the vertices 2i and 2i + 1 in that row
    const edgesH = new Map();
    for (let i = 0; i < sortX.length; i += 2) {
      edgesH.set(sortX[i], sortX[i + 1]);
      edgesH.set(sortX[i + 1], sortX[i]);
    }

    // go through each column and create edges between the vertices 2i and 2i + 1 in that column
    const edgesV = new Map();
    for (let i = 0; i < sortY.length; i += 2) {
      edgesV.set(sortY[i], sortY[i + 1]);
      edgesV.set(sortY[i + 1], sortY[i]);
    }

    const polygons = [];

    while (edgesH.size > 0) {
      // can start from any point
      const items = [edgesH.keys().next().value];

      do {
        const item = items[items.length - 1];
        if (items.length % 2 === 0) {
          items.push(popitem(edgesH, item));
        } else {
          items.push(popitem(edgesV, item));
        }
      } while (
        items[0].x !== items[items.length - 1].x ||
        items[0].y !== items[items.length - 1].y
      );

      items.pop();

      const polygon = [];
      items.forEach((item) => {
        if (edgesH.has(item)) edgesH.delete(item);
        if (edgesV.has(item)) edgesV.delete(item);
        polygon.push(item.x, item.y);
      });
      polygons.push(polygon);
    }

    return polygons;
  }
})();
