// constants
const COLOR = { grey: 0x21252f, pink: 0xec407a, white: 0xf2f5ea };
const SIZE = 40;
const COLS = 18;
const ROWS = 13;
const FONT_STYLE = {
  fontSize: 10,
  fontFamily: '"Courier New", Courier, monospace',
  fill: COLOR.white,
};

// create application
const app = new PIXI.Application({
  backgroundColor: COLOR.grey,
  antialias: true,
});
document.body.appendChild(app.view);

// add graphics
const graphicsGrid = new PIXI.Graphics();
app.stage.addChild(graphicsGrid);

const graphicsPath = new PIXI.Graphics();
app.stage.addChild(graphicsPath);

// define grid
const grid = [];
for (let col = 0; col < COLS; col++) {
  grid.push([]);
  for (let row = 0; row < ROWS; row++) {
    grid[col].push({ col, row, id: `${col}x${row}`, wall: false });
  }
}

// get and draw start and goal nodes
const start = grid[4][6];
const goal = grid[13][6];

graphicsGrid.beginFill(COLOR.pink);
graphicsGrid.drawCircle((start.col + 1.5) * SIZE, (start.row + 1.5) * SIZE, 8);
graphicsGrid.drawCircle((goal.col + 1.5) * SIZE, (goal.row + 1.5) * SIZE, 8);
graphicsGrid.endFill();

// draw grid
graphicsGrid.lineStyle(0.5, COLOR.white);
for (let col = 0; col < COLS; col++) {
  for (let row = 0; row < ROWS; row++) {
    const x = (col + 1) * SIZE;
    const y = (row + 1) * SIZE;
    graphicsGrid.drawRect(x, y, SIZE, SIZE);
    addNode(x, y, grid[col][row]);
  }
}

// add node interaction and label: col and row
function addNode(x, y, data) {
  const container = new PIXI.Container();
  app.stage.addChild(container);
  container.position.set(x, y);

  const sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  container.addChild(sprite);
  sprite.width = SIZE;
  sprite.height = SIZE;
  sprite.alpha = 0.05;
  sprite.interactive = true;
  sprite.buttonMode = true;
  data.sprite = sprite;

  sprite.on('pointerdown', () => {
    data.wall = !data.wall;
    sprite.alpha = data.wall ? 0.5 : 0.05;
    drawPath();
  });

  const label = new PIXI.Text(data.id, FONT_STYLE);
  container.addChild(label);
  data.label = label;
}

// return the adjacent edges of a node: north, south, east and west
function getAdjacentEdges(grid, col, row) {
  const edges = [];
  if (col < COLS - 1) edges.push(grid[col + 1][row]);
  if (row < ROWS - 1) edges.push(grid[col][row + 1]);
  if (row > 0) edges.push(grid[col][row - 1]);
  if (col > 0) edges.push(grid[col - 1][row]);
  return edges;
}

function breadthFirstSearch(graph, start, goal) {
  const frontier = [];
  frontier.push(start);
  const cameFrom = { [start.id]: null };

  let step = 0;

  while (frontier.length > 0) {
    const current = frontier.shift();

    if (current.id === goal.id) break;

    getAdjacentEdges(graph, current.col, current.row).forEach((next) => {
      if (!next.wall && !cameFrom[next.id]) {
        frontier.push(next);
        cameFrom[next.id] = current;

        // WARN: it's not necessery only for educational purposes
        next.step = step;
      }
    });

    step++;
  }

  return cameFrom;
}

function reconstructPath(cameFrom, start, goal, path = []) {
  if (goal) {
    path.push(goal);

    if (start.id !== goal.id) {
      return reconstructPath(cameFrom, start, cameFrom[goal.id], path);
    }
  }

  return path;
}

const timeoutIDs = [];
function drawPath() {
  // reset grid
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      grid[col][row].sprite.tint = 0xffffff;
      grid[col][row].label.style.fill = COLOR.white;
    }
  }
  graphicsPath.clear();

  // find the path
  const cameFrom = breadthFirstSearch(grid, start, goal);
  const path = reconstructPath(cameFrom, start, goal);

  // draw the path
  graphicsPath.lineStyle(3, COLOR.pink);
  path.forEach((node, index) => {
    const x = (node.col + 1.5) * SIZE;
    const y = (node.row + 1.5) * SIZE;
    if (index === 0) graphicsPath.moveTo(x, y);
    else graphicsPath.lineTo(x, y);
  });

  // show visited nodes
  timeoutIDs.forEach((id) => clearTimeout(id));
  const flattenGrid = grid.concat().flat();
  Object.keys(cameFrom).forEach((key) => {
    const node = flattenGrid.find((n) => n.id === key);
    const timeoutID = setTimeout(() => {
      node.sprite.tint = COLOR.pink;
      node.label.style.fill = COLOR.pink;
    }, node.step * 10);
    timeoutIDs.push(timeoutID);
  });
}
