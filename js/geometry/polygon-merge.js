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
    createShape(200, 200, [0, 0, 150, 0, 60, 100]),
    createShape(300, 150, [0, 0, 150, 0, 200, 200, 0, 200]),
    createShape(450, 300, [0, 0, 100, 0, 100, 100, 0, 100]),
    createShape(
      480,
      140,
      [0, -50, 220, 0, 200, 50, 150, 50, 0, 200, -100, 100],
    ),
  ];

  function createShape(x, y, path) {
    const shape = new PIXI.Graphics();
    app.stage.addChild(shape);
    shape.position.set(x, y);
    shape.poly(path);
    shape.stroke({ width: 1, color: color.white, alpha: 0.5 });
    shape.fill({ color: 0, alpha: 0.01 });

    shape.getPolygon = () => {
      return path.map((n, i) => (i % 2 === 0 ? n + shape.x : n + shape.y));
    };
    shape.eventMode = 'dynamic';
    shape.cursor = 'pointer';
    shape.offset = new PIXI.Point();
    return shape;
  }

  // listen to pointer events
  let dragging = null;
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    if (dragging === null) return;

    dragging.position.set(
      event.data.global.x - dragging.offset.x,
      event.data.global.y - dragging.offset.y,
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

    const polygons = mergeAll(shapes.map((shape) => shape.getPolygon()));

    polygons.forEach((polygon) => {
      graphics.poly(polygon);
    });
    graphics.stroke({ width: 5, color: color.pink });
  }
  draw();

  function mergeAll(polygons) {
    for (let i = 0; i < polygons.length; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        const p = merge(polygons[i], polygons[j]);
        if (p.length === 1) {
          polygons.splice(i, 1, p[0]);
          polygons.splice(j, 1);
          j = i;
        }
      }
    }

    return polygons;
  }

  function merge(polygonA, polygonB) {
    const polygon1 = findIntersections(polygonA, polygonB);
    const polygon2 = findIntersections(polygonB, polygonA);

    // if it did not find any intersection points
    if (polygon1.length === polygonA.length) {
      // polygonA contains polygonB - return polygonA
      for (let i = 0; i < polygonB.length; i += 2) {
        if (contains(polygonB[i], polygonB[i + 1], polygonA)) {
          return [polygonA];
        }
      }

      // polygonB contains polygonA - return polygonB
      for (let i = 0; i < polygonA.length; i += 2) {
        if (contains(polygonA[i], polygonA[i + 1], polygonB)) {
          return [polygonB];
        }
      }

      // polygonA and polygonB do not intersect - return both
      return [polygonA, polygonB];
    }

    const first = findMinimum(polygon1, polygon2);
    const graph = constructGraph(polygon1, polygon2);

    const key = `${first.x.toFixed(2)}x${first.y.toFixed(2)}`;
    const available = graph.get(key);
    graph.delete(key);

    const second =
      ccw(available[0], first, available[available.length - 1]) <
      ccw(available[available.length - 1], first, available[0])
        ? available[0]
        : available[available.length - 1];

    const array = getContour(second, graph, [first.x, first.y]);
    return [array];
  }

  function findIntersections(polygon1, polygon2) {
    const polygon = [];
    const len1 = polygon1.length;
    const len2 = polygon2.length;

    for (let i = 0; i < len1; i += 2) {
      const intersections = [];
      for (let j = 0; j < len2; j += 2) {
        const intersection = lineIntersection(
          { x: polygon1[i], y: polygon1[i + 1] },
          { x: polygon1[(i + 2) % len1], y: polygon1[(i + 3) % len1] },
          { x: polygon2[j], y: polygon2[j + 1] },
          { x: polygon2[(j + 2) % len2], y: polygon2[(j + 3) % len2] },
        );
        if (!intersection) continue;
        intersections.push(intersection);
      }

      polygon.push(polygon1[i], polygon1[i + 1]);

      if (intersections.length > 0) {
        const v = { x: polygon1[i], y: polygon1[i + 1] };
        intersections.sort((a, b) => {
          return FVector.distanceBetween(v, a) - FVector.distanceBetween(v, b);
        });

        intersections.forEach((p) => {
          polygon.push(p.x, p.y);
        });
      }
    }

    return polygon;
  }

  function findMinimum(polygon1, polygon2) {
    const polygon = polygon1.concat(polygon2);
    const min = {
      x: Number.MAX_SAFE_INTEGER,
      y: Number.MAX_SAFE_INTEGER,
    };
    for (let i = 0; i < polygon.length; i += 2) {
      if (
        min.x > polygon[i] ||
        (min.x === polygon[i] && min.y > polygon[i + 1])
      ) {
        min.x = polygon[i];
        min.y = polygon[i + 1];
      }
    }
    return min;
  }

  function constructGraph(polygon1, polygon2) {
    const graph = new Map();
    addConnectedEdges(graph, polygon1, polygon2);
    addConnectedEdges(graph, polygon2, polygon1);
    return graph;
  }

  function addConnectedEdges(graph, polygon1, polygon2) {
    const len1 = polygon1.length;
    const len2 = polygon2.length;

    for (let i = 0; i < len1; i += 2) {
      const vertex = {
        x: polygon1[i],
        y: polygon1[i + 1],
      };

      const key = `${vertex.x.toFixed(2)}x${vertex.y.toFixed(2)}`;
      if (graph.has(key)) continue;

      edges = [
        {
          x: polygon1[(i + 2) % len1],
          y: polygon1[(i + 3) % len1],
        },
        {
          x: polygon1[(len1 + i - 2) % len1],
          y: polygon1[(len1 + i - 1) % len1],
        },
      ];

      const index = findIndex(vertex, polygon2);
      if (index !== -1) {
        edges.push(
          {
            x: polygon2[(index + 2) % len2],
            y: polygon2[(index + 3) % len2],
          },
          {
            x: polygon2[(len2 + index - 2) % len2],
            y: polygon2[(len2 + index - 1) % len2],
          },
        );
      }

      graph.set(key, edges);
    }

    return graph;
  }

  function getContour(curr, graph, array = []) {
    const prev = { x: array[array.length - 2], y: array[array.length - 1] };
    array.push(curr.x, curr.y);

    const key = `${curr.x.toFixed(2)}x${curr.y.toFixed(2)}`;
    if (!graph.has(key)) return array;

    const available = graph.get(key);
    graph.delete(key);

    let next = undefined;
    let value = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < available.length; i++) {
      if (approximately(available[i], prev)) continue;
      if (approximately(available[i], { x: array[0], y: array[1] }))
        return array;
      const tmp = ccw(prev, curr, available[i]);
      if (value > tmp) {
        next = available[i];
        value = tmp;
      }
    }

    if (!next) return array;

    return getContour(next, graph, array);
  }

  function findIndex(vector, polygon) {
    for (let i = 0; i < polygon.length; i += 2) {
      if (approximately(vector, { x: polygon[i], y: polygon[i + 1] })) return i;
    }
    return -1;
  }

  function approximately(v1, v2) {
    return Math.abs(v1.x - v2.x) < 0.01 && Math.abs(v1.y - v2.y) < 0.01;
  }

  function ccw(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  function lineIntersection(line1Start, line1End, line2Start, line2End) {
    const denominator =
      (line2End.y - line2Start.y) * (line1End.x - line1Start.x) -
      (line2End.x - line2Start.x) * (line1End.y - line1Start.y);

    if (denominator === 0) return;

    let a = line1Start.y - line2Start.y;
    let b = line1Start.x - line2Start.x;
    const numerator1 =
      (line2End.x - line2Start.x) * a - (line2End.y - line2Start.y) * b;
    const numerator2 =
      (line1End.x - line1Start.x) * a - (line1End.y - line1Start.y) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    if (a > 0 && a < 1 && b > 0 && b < 1) {
      return {
        x: line1Start.x + a * (line1End.x - line1Start.x),
        y: line1Start.y + a * (line1End.y - line1Start.y),
      };
    }
    return;
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
})();
