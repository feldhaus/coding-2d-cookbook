// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const PI_2 = Math.PI / 2;

// create application
const app = new PIXI.Application({
  backgroundColor: COLOR.grey,
  antialias: true,
});
document.body.appendChild(app.view);

// create shape (graphics)
const shapes = new PIXI.Graphics();
app.stage.addChild(shapes);
shapes.lineStyle(2, COLOR.white);

// triangles
drawPolygon(shapes, 100, 110, 3, 80, 80, 0);
drawPolygon(shapes, 100, 250, 3, 80, 15, 0);
drawPolygon(shapes, 100, 390, 3, 80, 0, 0);
drawPolygon(shapes, 100, 490, 3, 80, 80, Math.PI);

// squares
drawPolygon(shapes, 250, 90, 4, 60, 60, 0);
drawPolygon(shapes, 250, 230, 4, 60, 20, 0);
drawPolygon(shapes, 250, 370, 4, 60, 0, 0);
drawPolygon(shapes, 250, 510, 4, 80, 80, Math.PI / 4);

// pentagons
drawPolygon(shapes, 400, 95, 5, 65, 65, 0);
drawPolygon(shapes, 400, 237, 5, 65, 25, 0);
drawPolygon(shapes, 400, 377, 5, 65, 0, 0);
drawPolygon(shapes, 400, 505, 5, 65, 65, Math.PI);

// hexagons
drawPolygon(shapes, 550, 90, 6, 60, 60, 0);
drawPolygon(shapes, 550, 230, 6, 60, 40, 0);
drawPolygon(shapes, 550, 370, 6, 60, 0, 0);
drawPolygon(shapes, 550, 510, 6, 60, 60, Math.PI / 2);

// heptagons
drawPolygon(shapes, 700, 90, 7, 60, 60, 0);
drawPolygon(shapes, 700, 234, 7, 60, 40, 0);
drawPolygon(shapes, 700, 374, 7, 60, 0, 0);
drawPolygon(shapes, 700, 510, 7, 60, 60, Math.PI);

function drawPolygon(graphics, x, y, sides, radius1, radius2, angle) {
  // if they are different doubles the number of sides (star)
  if (radius2 !== radius1) {
    sides = 2 * sides;
  }

  // get all points
  const slice = Math.PI / sides;
  for (let i = 0; i <= sides; i++) {
    const a = i * 2 * slice - PI_2 + angle;
    const r = i % 2 === 0 ? radius1 : radius2;
    if (i === 0) {
      graphics.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    } else {
      graphics.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
  }
}
