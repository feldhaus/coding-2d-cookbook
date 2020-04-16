// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const DEG2RAD = Math.PI / 180;
const DURATION = 100;
const DEPTH = 10;

// create application
const app = new PIXI.Application({
  backgroundColor: COLOR.grey,
  antialias: true,
});
document.body.appendChild(app.view);

const center = new PIXI.Point(
  app.renderer.width * 0.5,
  app.renderer.height * 0.5
);

// add tree graphics
const tree = new PIXI.Graphics();
app.stage.addChild(tree);
tree.lineStyle(2, COLOR.white);

// add tree fill animation graphics
const animation = new PIXI.Graphics();
app.stage.addChild(animation);

// runs an update loop
let elapsedTime = 0;
app.ticker.add(function (deltaTime) {
  update(deltaTime);
});

let array = [];
drawTree(center.x, app.renderer.height, -90, DEPTH);
array.reverse();

function drawTree(x1, y1, angle, depth) {
  if (depth > 0) {
    const x2 = x1 + Math.cos(angle * DEG2RAD) * depth * 10;
    const y2 = y1 + Math.sin(angle * DEG2RAD) * depth * 10;

    const p1 = new PIXI.Point(x1, y1);
    const p2 = new PIXI.Point(x2, y2);

    if (array[depth - 1]) {
      array[depth - 1].push({ p1: p1, p2: p2 });
    } else {
      array[depth - 1] = [{ p1: p1, p2: p2 }];
    }

    tree.moveTo(x1, y1);
    tree.lineTo(x2, y2);

    drawTree(x2, y2, angle - Math.random() * 15 - 15, depth - 1);
    drawTree(x2, y2, angle + Math.random() * 15 + 15, depth - 1);
  }
}

function update(deltaTime) {
  elapsedTime += deltaTime;
  const t = (elapsedTime % DURATION) / DURATION;
  const ix = Math.floor(elapsedTime / DURATION);
  if (ix < DEPTH) {
    animation.clear();
    animation.lineStyle(2, COLOR.pink, 1);
    for (let i = 0; i < ix + 1; i++) {
      for (let j = 0; j < array[i].length; j++) {
        const p1 = array[i][j].p1;
        const p2 = array[i][j].p2;
        if (i === ix) {
          animation.moveTo(p1.x, p1.y);
          animation.lineTo(lerp(p1.x, p2.x, t), lerp(p1.y, p2.y, t));
        } else {
          animation.moveTo(p1.x, p1.y);
          animation.lineTo(p2.x, p2.y);
          animation.drawCircle(p2.x, p2.y, 2);
        }
      }
    }
  }
}

function lerp(start, end, threshold) {
  return start + (end - start) * threshold;
}
