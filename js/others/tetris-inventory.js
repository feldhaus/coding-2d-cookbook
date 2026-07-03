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
  const cols = 10;
  const rows = 13;
  const fontStyle = {
    fontSize: 10,
    fontFamily: '"Courier New", Courier, monospace',
    fill: color.white,
  };
  const grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

  let nextColor = 0;

  // add graphics
  const graphicsGrid = new PIXI.Graphics();
  app.stage.addChild(graphicsGrid);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * size;
      const y = row * size;
      graphicsGrid.rect(x + size, y + size, size, size);

      const label = new PIXI.Text({
        text: `${col}x${row}`,
        style: fontStyle,
      });
      label.position.set(x + size, y + size);
      app.stage.addChild(label);
    }
  }
  graphicsGrid.stroke({ width: 0.5, color: color.white });

  createShape(480, 40, [
    [1, 1, 1],
    [0, 1, 0],
  ]);
  createShape(480, 160, [
    [1, 1, 1],
    [1, 0, 0],
  ]);
  createShape(480, 280, [[1, 1, 1, 1]]);
  createShape(480, 360, [[1], [1]]);
  createShape(560, 360, [[1], [1]]);
  createShape(640, 400, [[1]]);
  createShape(480, 480, [
    [1, 0, 1, 0],
    [1, 1, 1, 1],
  ]);
  createShape(640, 40, [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ]);
  createShape(680, 200, [
    [1, 1],
    [1, 1],
  ]);
  createShape(680, 320, [
    [1, 1],
    [0, 1],
  ]);
  createShape(680, 440, [
    [0, 1],
    [0, 1],
    [1, 1],
  ]);

  function createShape(x, y, shape) {
    const g = new PIXI.Graphics();
    app.stage.addChild(g);

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          g.rect(j * size, i * size, size - 4, size - 4);
        }
      }
    }

    const colors = [0xec407a, 0x66baa8, 0xc5fcee];
    const color = colors[nextColor];
    nextColor = (nextColor + 1) % colors.length;

    g.fill({ color, alpha: 1 });
    g.eventMode = 'dynamic';
    g.cursor = 'pointer';
    g.on('pointerdown', onDragStart);

    g.pivot.set(g.width * 0.5, g.height * 0.5);
    g.position.set(x + g.pivot.x, y + g.pivot.y);

    g.initialX = g.position.x; // Store initial position in case of invalid drop
    g.initialY = g.position.y;
    g.shape = shape; // Store the shape array for reference during drop

    return g;
  }

  // dragging
  let dragTarget = null;

  // listen to pointer and key events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  // app.stage.on('pointermove', (event) => {});
  app.stage.on('pointerup', onDragEnd);
  app.stage.on('pointerupoutside', onDragEnd);

  function onDragMove(event) {
    if (!dragTarget) return;
    dragTarget.parent.toLocal(event.global, null, dragTarget.position);
  }

  function onDragStart(event) {
    event.target.alpha = 0.5;
    dragTarget = event.target;

    dragTarget.initialX = dragTarget.position.x;
    dragTarget.initialY = dragTarget.position.y;
    dragTarget.initialRotation = dragTarget.rotation;
    dragTarget.initialShape = dragTarget.shape.map((row) => [...row]); // clone the shape

    const { width, height } = calculateShapeDimensions(dragTarget.shape, size);
    const offsetX = width * 0.5;
    const offsetY = height * 0.5;

    const temp = size;
    const dragX = dragTarget.x - offsetX - temp;
    const dragY = dragTarget.y - offsetY - temp;

    // Get the shape's previous grid position
    dragTarget.initialCol = Math.round(dragX / size);
    dragTarget.initialRow = Math.round(dragY / size);
    const shape = dragTarget.shape;

    // Clear the shape from the grid
    clearShapeFromGrid(
      grid,
      shape,
      dragTarget.initialRow,
      dragTarget.initialCol,
    );

    app.stage.on('pointermove', onDragMove);
  }

  function onDragEnd() {
    if (!dragTarget) return;
    app.stage.off('pointermove', onDragMove);
    dragTarget.alpha = 1;

    app.stage.setChildIndex(dragTarget, 0);

    // dragTarget = null;

    const { width, height } = calculateShapeDimensions(dragTarget.shape, size);
    const offsetX = width * 0.5;
    const offsetY = height * 0.5;

    console.log(dragTarget.x, dragTarget.y, offsetX, offsetY);
    const temp = size;

    // Get the top-left corner of the dropped shape relative to the grid
    const dropX = dragTarget.x - offsetX - temp;
    const dropY = dragTarget.y - offsetY - temp;

    // Calculate the row and column on the grid
    const col = Math.round(dropX / size);
    const row = Math.round(dropY / size);

    // Get the shape's dimensions (you'll need to track this when creating the shape)
    const shape = dragTarget.shape; // Assumed you stored the shape array when creating

    // Check if the shape can fit in the grid
    if (canFitInGrid(grid, shape, row, col)) {
      // Place the shape in the grid
      placeShapeInGrid(grid, shape, row, col);

      // Snap the shape to the grid (align with grid coordinates)
      dragTarget.position.set(
        col * size + offsetX + temp,
        row * size + offsetY + temp,
      );
    } else {
      // Optionally, return the shape to its original position or provide feedback
      dragTarget.position.set(dragTarget.initialX, dragTarget.initialY);
      dragTarget.rotation = dragTarget.initialRotation;
      dragTarget.shape = dragTarget.initialShape;
      placeShapeInGrid(
        grid,
        dragTarget.initialShape,
        dragTarget.initialRow,
        dragTarget.initialCol,
      );
    }

    dragTarget = null;
  }

  document.onkeydown = function (event) {
    event.preventDefault();

    if (!dragTarget) return;

    if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
      dragTarget.rotation -= FMath.HALF_PI;
      dragTarget.shape = rotateMatrix(dragTarget.shape, 'left');
    } else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
      dragTarget.rotation += FMath.HALF_PI;
      dragTarget.shape = rotateMatrix(dragTarget.shape, 'right');
    }
  };

  function canFitInGrid(grid, shape, row, col) {
    if (isOutOfBounds(grid, shape, row, col)) {
      return;
    }
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          // Check if the shape is out of bounds or overlapping an occupied cell
          if (
            row + i >= grid.length ||
            col + j >= grid[0].length ||
            grid[row + i][col + j] === 1
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function placeShapeInGrid(grid, shape, row, col) {
    if (isOutOfBounds(grid, shape, row, col)) {
      return;
    }
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          grid[row + i][col + j] = 1; // Mark the cell as occupied
        }
      }
    }
    printMatrix(grid);
  }

  function clearShapeFromGrid(grid, shape, row, col) {
    if (isOutOfBounds(grid, shape, row, col)) {
      return;
    }
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          grid[row + i][col + j] = 0; // Mark the cell as available
        }
      }
    }
    printMatrix(grid);
  }

  function isOutOfBounds(grid, shape, row, col) {
    return (
      row < 0 ||
      col < 0 ||
      row + shape.length > grid.length ||
      col + shape[0].length > grid[0].length
    );
  }

  function calculateShapeDimensions(shape, size) {
    let minCol = shape[0].length; // Initialize to max possible column length
    let maxCol = 0;
    let minRow = shape.length; // Initialize to max possible row length
    let maxRow = 0;

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          // Update the boundaries based on the position of '1's
          minCol = Math.min(minCol, j);
          maxCol = Math.max(maxCol, j);
          minRow = Math.min(minRow, i);
          maxRow = Math.max(maxRow, i);
        }
      }
    }

    // Calculate width and height based on the found min/max boundaries
    const width = (maxCol - minCol + 1) * size;
    const height = (maxRow - minRow + 1) * size;

    return { width, height };
  }

  function rotateMatrix(matrix, direction) {
    if (direction === 'left') {
      matrix = reverseMatrix(matrix);
      matrix = transposeMatrix(matrix);
    } else if (direction === 'right') {
      matrix = transposeMatrix(matrix);
      matrix = reverseMatrix(matrix);
    }
    return matrix;
  }

  function printMatrix(matrix) {
    console.log('-------------------------');
    for (let i = 0; i < matrix.length; i++) {
      console.log(`${i.toString().padStart(2, '0')}_`, matrix[i].join(','));
    }
  }

  function reverseMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    for (let i = 0; i < Math.floor(cols / 2); i++) {
      for (let j = 0; j < rows; j++) {
        const temp = matrix[j][cols - 1 - i];
        matrix[j][cols - 1 - i] = matrix[j][i];
        matrix[j][i] = temp;
      }
    }
    return matrix;
  }

  function transposeMatrix(matrix) {
    const sourceRowCount = matrix.length;
    const sourceColCount = matrix[0].length;
    const newMatrix = new Array(sourceColCount);

    for (let i = 0; i < sourceColCount; i++) {
      newMatrix[i] = new Array(sourceRowCount);
      for (let j = sourceRowCount - 1; j > -1; j--) {
        newMatrix[i][j] = matrix[j][i];
      }
    }
    return newMatrix;
  }
})();
