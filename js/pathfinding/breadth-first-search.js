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
  const size = 40;
  const cols = 18;
  const rows = 13;
  const fontStyle = {
    fontSize: 10,
    fontFamily: '"Courier New", Courier, monospace',
    fill: color.white,
  };

  // add graphics
  const graphicsGrid = new PIXI.Graphics();
  app.stage.addChild(graphicsGrid);

  const graphicsPath = new PIXI.Graphics();
  app.stage.addChild(graphicsPath);

  // define grid
  const grid = [];
  for (let col = 0; col < cols; col++) {
    grid.push([]);
    for (let row = 0; row < rows; row++) {
      grid[col].push({ col, row, id: `${col}x${row}`, wall: false });
    }
  }

  // get and draw start and goal nodes
  const start = grid[4][6];
  const goal = grid[13][6];

  graphicsGrid.circle((start.col + 1.5) * size, (start.row + 1.5) * size, 8);
  graphicsGrid.circle((goal.col + 1.5) * size, (goal.row + 1.5) * size, 8);
  graphicsGrid.fill({ color: color.pink });

  // draw grid
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = (col + 1) * size;
      const y = (row + 1) * size;
      graphicsGrid.rect(x, y, size, size);
      addNode(x, y, grid[col][row]);
    }
  }
  graphicsGrid.stroke({ width: 0.5, color: color.white });

  // add node interaction and label: col and row
  function addNode(x, y, data) {
    const container = new PIXI.Container();
    app.stage.addChild(container);
    container.position.set(x, y);

    const sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
    container.addChild(sprite);
    sprite.width = size;
    sprite.height = size;
    sprite.alpha = 0.05;
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    data.sprite = sprite;

    sprite.on('pointerdown', () => {
      data.wall = !data.wall;
      sprite.alpha = data.wall ? 0.5 : 0.05;
      drawPath();
    });

    const label = new PIXI.Text({ text: data.id, style: fontStyle });
    container.addChild(label);
    data.label = label;
  }

  // return the adjacent edges of a node: north, south, east and west
  function getAdjacentEdges(grid, col, row) {
    const edges = [];
    if (col < cols - 1) edges.push(grid[col + 1][row]);
    if (row < rows - 1) edges.push(grid[col][row + 1]);
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

          // WARN: it's not necessary only for "educational" purposes
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
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        grid[col][row].sprite.tint = 0xffffff;
        grid[col][row].label.style.fill = color.white;
      }
    }
    graphicsPath.clear();

    // find the path
    const cameFrom = breadthFirstSearch(grid, start, goal);
    const path = reconstructPath(cameFrom, start, goal);

    // draw the path
    path.forEach((node, index) => {
      const x = (node.col + 1.5) * size;
      const y = (node.row + 1.5) * size;
      if (index === 0) graphicsPath.moveTo(x, y);
      else graphicsPath.lineTo(x, y);
    });
    graphicsPath.stroke({ width: 3, color: color.pink });

    // show visited nodes
    timeoutIDs.forEach((id) => clearTimeout(id));
    const flattenGrid = grid.concat().flat();
    Object.keys(cameFrom).forEach((key) => {
      const node = flattenGrid.find((n) => n.id === key);
      const timeoutID = setTimeout(() => {
        node.sprite.tint = color.pink;
        node.label.style.fill = color.pink;
      }, node.step * 10);
      timeoutIDs.push(timeoutID);
    });
  }
})();
