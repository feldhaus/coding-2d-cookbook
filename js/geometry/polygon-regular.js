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
  const tau = Math.PI * 2; // alias for two pi

  // add graphics
  const shapes = new PIXI.Graphics();
  app.stage.addChild(shapes);

  drawPolygon(shapes, 100, 110, 3, 80, 80, 0);
  drawPolygon(shapes, 100, 250, 3, 80, 15, 0);
  drawPolygon(shapes, 100, 390, 3, 80, 0, 0);
  drawPolygon(shapes, 100, 490, 3, 80, 80, Math.PI);

  drawPolygon(shapes, 250, 90, 4, 60, 60, 0);
  drawPolygon(shapes, 250, 230, 4, 60, 20, 0);
  drawPolygon(shapes, 250, 370, 4, 60, 0, 0);
  drawPolygon(shapes, 250, 510, 4, 80, 80, Math.PI / 4);

  drawPolygon(shapes, 400, 95, 5, 65, 65, 0);
  drawPolygon(shapes, 400, 237, 5, 65, 25, 0);
  drawPolygon(shapes, 400, 377, 5, 65, 0, 0);
  drawPolygon(shapes, 400, 505, 5, 65, 65, Math.PI);

  drawPolygon(shapes, 550, 90, 6, 60, 60, 0);
  drawPolygon(shapes, 550, 230, 6, 60, 40, 0);
  drawPolygon(shapes, 550, 370, 6, 60, 0, 0);
  drawPolygon(shapes, 550, 510, 6, 60, 60, Math.PI / 2);

  drawPolygon(shapes, 700, 90, 7, 60, 60, 0);
  drawPolygon(shapes, 700, 234, 7, 60, 40, 0);
  drawPolygon(shapes, 700, 374, 7, 60, 0, 0);
  drawPolygon(shapes, 700, 510, 7, 60, 60, Math.PI);

  shapes.stroke({ width: 2, color: color.white });

  function drawPolygon(graphics, x, y, sides, radius1, radius2, angle) {
    // if they are different doubles the number of sides (star)
    if (radius2 !== radius1) {
      sides = 2 * sides;
    }

    const startAngle = angle - Math.PI / 2;

    // get all points
    const slice = tau / sides;
    const polygon = [];
    for (let i = 0; i < sides; i++) {
      const radius = i % 2 === 0 ? radius1 : radius2;
      polygon.push(pointTranslate({ x, y }, startAngle + i * slice, radius));
    }
    graphics.poly(polygon);
  }

  // translates a point by an angle in radians and distance
  function pointTranslate(point, angle, distance) {
    return new PIXI.Point(
      point.x + distance * Math.cos(angle),
      point.y + distance * Math.sin(angle),
    );
  }
})();
