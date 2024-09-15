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

  // add circle graphcis
  const circle = new PIXI.Graphics();
  app.stage.addChild(circle);
  circle.position.set(200, 300);

  // add polygon graphcis
  const polygon = new PIXI.Graphics();
  app.stage.addChild(polygon);
  polygon.position.set(600, 300);

  // variables
  let elapsedTime = 0;
  let dash = 10;
  let gap = 18;

  // ticker for doing render updates
  app.ticker.add(({ elapsedMS, deltaTime }) => {
    elapsedTime += elapsedMS;
    const offset = elapsedTime * 0.001;

    circle.clear();
    drawDashedCircle(circle, 150, dash, gap, offset);
    circle.stroke({ width: 5, color: color.pink });

    polygon.clear();
    drawDashedPolygon(polygon, starPolygon, dash, gap, offset);
    polygon.stroke({ width: 3, color: color.white });
    polygon.rotation += deltaTime * 0.01;
  });

  document.onkeydown = function (event) {
    // dash (min: 1 - max: 50)
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      dash = Math.min(dash + 1, 50);
    } else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
      dash = Math.max(dash - 1, 1);
    }
    event.preventDefault();

    // gap (min: 1 - max: 50)
    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      gap = Math.min(gap + 1, 50);
      event.preventDefault();
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      gap = Math.max(gap - 1, 1);
      event.preventDefault();
    }
  };

  function drawDashedCircle(graphics, radius, dash, gap, offset) {
    const circum = radius * tau;
    const stepSize = dash + gap;
    const chunks = Math.ceil(circum / stepSize);
    const chunkAngle = tau / chunks;
    const dashAngle = (dash / stepSize) * chunkAngle;
    const offsetAngle = offset * chunkAngle;

    let theta = offsetAngle;

    graphics.moveTo(radius * Math.cos(theta), radius * Math.sin(theta));
    for (let i = 0; i < chunks; i++) {
      theta = chunkAngle * i + offsetAngle;
      graphics.arc(0, 0, radius, theta, theta + dashAngle);
      graphics.moveTo(
        radius * Math.cos(theta + chunkAngle),
        radius * Math.sin(theta + chunkAngle),
      );
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
