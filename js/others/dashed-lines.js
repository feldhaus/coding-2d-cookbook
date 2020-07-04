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
const circumference = Math.PI * 2;
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
let gap = 5;

// ticker for doing render updates
app.ticker.add(function (deltaTime) {
  elapsedTime += deltaTime;
  const offset = elapsedTime * 0.01;

  circle.clear();
  circle.lineStyle(5, color.pink);
  drawDashedCircle(circle, 150, dash, gap, offset);

  polygon.clear();
  polygon.lineStyle(3, color.white);
  drawDashedPolygon(polygon, starPolygon, dash, gap, offset);
  polygon.rotation += deltaTime * 0.01;
});

document.onkeydown = function (event) {
  // dash (min: 1 - max: 50)
  if (event.keyCode === 39) {
    dash = Math.min(dash + 1, 50);
  } else if (event.keyCode === 37) {
    dash = Math.max(dash - 1, 1);
  }
  event.preventDefault();

  // gap (min: 1 - max: 50)
  if (event.keyCode === 38) {
    gap = Math.min(gap + 1, 50);
    event.preventDefault();
  } else if (event.keyCode === 40) {
    gap = Math.max(gap - 1, 1);
    event.preventDefault();
  }
};

function drawDashedCircle(graphics, radius, dash, gap, offset) {
  const circum = radius * circumference;
  const stepSize = dash + gap;
  const chunks = Math.ceil(circum / stepSize);
  const chunkAngle = circumference / chunks;
  const dashAngle = (dash / stepSize) * chunkAngle;
  const offsetAngle = offset * chunkAngle;

  let theta = offsetAngle;

  graphics.moveTo(radius * Math.cos(theta), radius * Math.sin(theta));
  for (let i = 0; i < chunks; i++) {
    theta = chunkAngle * i + offsetAngle;
    graphics.arc(0, 0, radius, theta, theta + dashAngle);
    graphics.moveTo(
      radius * Math.cos(theta + chunkAngle),
      radius * Math.sin(theta + chunkAngle)
    );
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
        p1.y + progressOnLine * normal.y
      );
      progressOnLine += gap;
      if (progressOnLine > len && dashLeft == 0) {
        gapLeft = progressOnLine - len;
      } else {
        gapLeft = 0;
        graphics.moveTo(
          p1.x + progressOnLine * normal.x,
          p1.y + progressOnLine * normal.y
        );
      }
    }
  }
}
