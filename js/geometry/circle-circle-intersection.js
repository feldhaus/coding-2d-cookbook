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
  const circle1 = createCircle(150);
  app.stage.addChild(circle1);
  circle1.position.set(center.x - 100, center.y);

  const circle2 = createCircle(100);
  app.stage.addChild(circle2);
  circle2.position.set(center.x + 100, center.y);

  const rect1 = new PIXI.Sprite({ texture: PIXI.Texture.WHITE });
  app.stage.addChild(rect1);
  rect1.anchor.set(0.5, 0.5);
  rect1.tint = color.pink;
  rect1.scale.set(20, 20);

  const rect2 = new PIXI.Sprite({ texture: PIXI.Texture.WHITE });
  app.stage.addChild(rect2);
  rect2.anchor.set(0.5, 0.5);
  rect2.tint = color.pink;
  rect2.scale.set(20, 20);

  function createCircle(radius) {
    const g = new PIXI.Graphics();
    g.circle(0, 0, radius + 20);
    g.fill({ color: color.white, alpha: 0.05 });
    g.circle(0, 0, radius);
    g.stroke({ width: 3, color: color.white });
    g.eventMode = 'dynamic';
    g.cursor = 'pointer';
    g.offset = new PIXI.Point();
    g.radius = radius;
    return g;
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

    circleIntersection();
  });

  [circle1, circle2].forEach((item) => {
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

  function circleIntersection() {
    const x1 = circle1.x,
      y1 = circle1.y,
      r1 = circle1.radius;
    const x2 = circle2.x,
      y2 = circle2.y,
      r2 = circle2.radius;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = FVector.distanceBetween(circle1, circle2);

    if (distance > r1 + r2) {
      // no intersect
      rect1.visible = false;
      rect2.visible = false;
    } else if (distance < Math.abs(r2 - r1)) {
      // no intersect - one circle is contained within the other
      rect1.visible = false;
      rect2.visible = false;
    } else if (distance === 0 && r1 === r2) {
      // no intersect - the circles are equal and coincident
      rect1.visible = false;
      rect2.visible = false;
    } else {
      rect1.visible = true;
      rect2.visible = true;

      const a = (r1 ** 2 - r2 ** 2 + distance ** 2) / (2 * distance);
      const h = Math.sqrt(r1 ** 2 - a ** 2);
      const x = x1 + (a * dx) / distance;
      const y = y1 + (a * dy) / distance;

      rect1.x = x + (h * dy) / distance;
      rect1.y = y - (h * dx) / distance;

      rect2.x = x - (h * dy) / distance;
      rect2.y = y + (h * dx) / distance;
    }
  }
  circleIntersection();
})();
