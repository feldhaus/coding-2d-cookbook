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
  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  const joints = Array.from({ length: 30 }, () => new PIXI.Point(0, 0));
  const angles = Array.from({ length: joints.length }, () => 0);
  const angleConstraint = Math.PI / 6;

  // listen to pointer events
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (event) => {
    angles[0] = FVector.angleBetween(joints[1], joints[0]);
    joints[0].copyFrom(event.data.global);

    for (let i = 1; i < joints.length; i++) {
      const currentAngle = FVector.angleBetween(joints[i], joints[i - 1]);
      angles[i] = constrainAngle(currentAngle, angles[i - 1], angleConstraint);

      const fangle = FVector.fromAngle(angles[i]);
      fangle.x *= bodyWidth(i);
      fangle.y *= bodyWidth(i);
      const vector = {
        x: joints[i - 1].x - fangle.x,
        y: joints[i - 1].y - fangle.y,
      };
      joints[i].copyFrom(vector);
    }

    draw();
  });

  function draw() {
    // draw
    graphics.clear();

    graphics.circle(joints[0].x, joints[0].y, bodyWidth(0));
    graphics.stroke({ color: color.white, width: 1, alpha: 0.25 });
    graphics.circle(joints[0].x, joints[0].y, 5);
    graphics.fill({ color: color.white, alpha: 0.25 });

    for (let i = 0; i < joints.length - 1; i++) {
      graphics.moveTo(joints[i].x, joints[i].y);
      graphics.lineTo(joints[i + 1].x, joints[i + 1].y);
      graphics.stroke({ width: 2, color: color.white, alpha: 0.25 });

      graphics.circle(joints[i + 1].x, joints[i + 1].y, bodyWidth(i + 1));
      graphics.stroke({ color: color.pink, width: 1, alpha: 0.25 });
      graphics.circle(joints[i + 1].x, joints[i + 1].y, 5);
      graphics.fill({ color: color.white, alpha: 0.25 });
    }

    const array = [];
    for (let i = 0; i < joints.length; i++) {
      array.push(...getPosition(i, FMath.HALF_PI, 0));
    }

    // tail
    for (let a = 90; a < 270; a += 20) {
      array.push(...getPosition(joints.length - 1, a * FMath.DEG2RAD, 0));
    }

    for (let i = joints.length - 1; i >= 0; i--) {
      array.push(...getPosition(i, -FMath.HALF_PI, 0));
    }

    // head
    for (let a = -90; a < 90; a += 10) {
      array.push(...getPosition(0, a * FMath.DEG2RAD, 0));
    }

    graphics.poly(array, true);
    graphics.stroke({ width: 2, color: color.pink });

    // eyes
    const eye1 = getPosition(0, FMath.HALF_PI, -20);
    graphics.circle(eye1[0], eye1[1], 10);
    graphics.fill({ color: color.pink });

    const eye2 = getPosition(0, -FMath.HALF_PI, -20);
    graphics.circle(eye2[0], eye2[1], 10);
    graphics.fill({ color: color.pink });
  }

  function getPosition(index, angleOffset, lengthOffset) {
    return [
      joints[index].x +
        Math.cos(angles[index] + angleOffset) *
          (bodyWidth(index) + lengthOffset),
      joints[index].y +
        Math.sin(angles[index] + angleOffset) *
          (bodyWidth(index) + lengthOffset),
    ];
  }

  function constrainAngle(angle, anchor, constraint) {
    if (Math.abs(relativeAngleDiff(angle, anchor)) <= constraint) {
      return FMath.normalizeAngle(angle);
    }

    if (relativeAngleDiff(angle, anchor) > constraint) {
      return FMath.normalizeAngle(anchor - constraint);
    }

    return FMath.normalizeAngle(anchor + constraint);
  }

  // i.e. How many radians do you need to turn the angle to match the anchor?
  function relativeAngleDiff(angle, anchor) {
    // Since angles are represented by values in [0, 2pi), it's helpful to rotate
    // the coordinate space such that PI is at the anchor. That way we don't have
    // to worry about the "seam" between 0 and 2pi.
    return Math.PI - FMath.normalizeAngle(angle + Math.PI - anchor);
  }

  function bodyWidth(i) {
    switch (i) {
      case 0:
        return 50;
      case 1:
        return 60;
      default:
        return 44 - i;
    }
  }
})();
