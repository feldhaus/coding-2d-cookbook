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
  const starPolygon = [
    { x: 0, y: -150 },
    { x: -38, y: -52 },
    { x: -142, y: -46 },
    { x: -62, y: 20 },
    { x: -88, y: 122 },
    { x: 0, y: 65 },
    { x: 88, y: 122 },
    { x: 62, y: 20 },
    { x: 142, y: -46 },
    { x: 38, y: -52 },
    { x: 0, y: -150 },
  ];

  // input - controls
  const controlsData = Object.assign({}, window.parent.controlsData);
  window.addEventListener('message', (event) => {
    const { type, key, value } = event.data;
    if (type !== 'sliderinput') return;
    controlsData[key] = value;
    draw();
  });

  // add graphcis
  const circle = new PIXI.Graphics();
  app.stage.addChild(circle);
  circle.position.set(200, 300);

  const polygon = new PIXI.Graphics();
  app.stage.addChild(polygon);
  polygon.position.set(600, 300);

  // runs an update loop
  let elapsedTime = 0;
  app.ticker.add(({ elapsedMS, deltaTime }) => {
    elapsedTime += elapsedMS;
    const offset = elapsedTime * 0.001;
    const { dash, gap } = controlsData;

    circle.clear();
    drawDashedCircle(circle, 150, dash, gap, offset);
    circle.stroke({ width: 5, color: color.pink });

    polygon.clear();
    drawDashedPolygon(polygon, starPolygon, dash, gap, offset);
    polygon.stroke({ width: 3, color: color.white });
    polygon.rotation += deltaTime * 0.01;
  });

  function drawDashedCircle(graphics, radius, dash, gap, offset) {
    const circum = radius * FMath.TAU;
    const stepSize = dash + gap;
    const chunks = Math.ceil(circum / stepSize);
    const chunkAngle = FMath.TAU / chunks;
    const dashAngle = (dash / stepSize) * chunkAngle;
    const offsetAngle = offset * chunkAngle;

    let theta = offsetAngle;
    let vector = FVector.VECTOR_ZERO;

    graphics.moveTo(radius * Math.cos(theta), radius * Math.sin(theta));
    for (let i = 0; i < chunks; i++) {
      theta = chunkAngle * i + offsetAngle;
      graphics.arc(0, 0, radius, theta, theta + dashAngle);
      vector = FVector.mult(FVector.fromAngle(theta + chunkAngle), radius);
      graphics.moveTo(vector.x, vector.y);
      graphics.closePath();
    }
  }

  function drawDashedPolygon(graphics, polygons, dash, gap, offset) {
    let p1, p2;
    let dashLeft = 0;
    let gapLeft = 0;
    let dx, dy;
    let len;
    let normal;
    let progressOnLine;
    let progressOffset;

    offset %= 1;
    if (offset > 0) {
      progressOffset = (dash + gap) * offset;
      if (progressOffset < dash) {
        dashLeft = dash - progressOffset;
      } else {
        gapLeft = gap - (progressOffset - dash);
      }
    }

    for (let i = 0; i < polygons.length; i++) {
      p1 = polygons[i];
      if (i == polygons.length - 1) {
        p2 = polygons[0];
      } else {
        p2 = polygons[i + 1];
      }

      dx = p2.x - p1.x;
      dy = p2.y - p1.y;
      len = Math.sqrt(dx * dx + dy * dy);
      normal = { x: dx / len, y: dy / len };
      progressOnLine = 0;

      graphics.moveTo(p1.x + gapLeft * normal.x, p1.y + gapLeft * normal.y);
      while (progressOnLine <= len) {
        progressOnLine += gapLeft;
        if (dashLeft > 0) {
          progressOnLine += dashLeft;
        } else {
          progressOnLine += dash;
        }
        if (progressOnLine > len) {
          dashLeft = progressOnLine - len;
          progressOnLine = len;
        } else {
          dashLeft = 0;
        }
        graphics.lineTo(
          p1.x + progressOnLine * normal.x,
          p1.y + progressOnLine * normal.y,
        );
        progressOnLine += gap;
        if (progressOnLine > len && dashLeft == 0) {
          gapLeft = progressOnLine - len;
        } else {
          gapLeft = 0;
          graphics.moveTo(
            p1.x + progressOnLine * normal.x,
            p1.y + progressOnLine * normal.y,
          );
        }
      }
    }
  }
})();
