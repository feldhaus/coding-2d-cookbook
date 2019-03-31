// constants
const COLOR = {
    grey: 0x21252f,
    pink: 0xec407a,
    white: 0xf2f5ea
};

// create application
const app = new PIXI.Application({
    backgroundColor: COLOR.grey,
    antialias: true
});
document.body.appendChild(app.view);

// add graphics
const map = new PIXI.Graphics();
app.stage.addChild(map);

const feedback = new PIXI.Graphics();
app.stage.addChild(feedback);

// add state name
const stateName = new PIXI.Text('', {
    fill: COLOR.pink,
    fontSize: 24
});
stateName.anchor.set(0, 1);
stateName.position.set(10, 590);
app.stage.addChild(stateName);

// fetch json map data
let mapData = {};

fetch("../../assets/json/usa-map.json")
    .then(res => res.json())
    .then(data => drawMap(data))

function drawMap(data) {
    mapData = data;
    map.lineStyle(2, COLOR.white);
    map.beginFill(COLOR.white, 0.05);
    Object.keys(data).forEach(state => {
        data[state].forEach(path=> {
            map.drawPolygon(path);
            map.closePath();
        });
    });
}

// listen pointer move event
app.renderer.plugins.interaction.on('pointermove', onPointerMove);

function onPointerMove (event) {
    // search if mouse position is over some state polygon
    let overState;
    Object.keys(mapData).forEach(state => {
        if (mapData[state].some(path => 
            contains(event.data.global.x, event.data.global.y, path)
        )) {
            overState = state;
            return;
        }
    });
    
    // show the feedback
    feedback.clear();
    if (overState) {
        stateName.text = overState;
        mapData[overState].forEach(path => {
            feedback.lineStyle(4, COLOR.pink);
            feedback.beginFill(COLOR.pink, 0.05);
            feedback.drawPolygon(path);
            feedback.closePath();
        });
    } else {
        stateName.text = '';
    }
}

function contains (x, y, polygon) {
    let inside = false;
    const length = polygon.length / 2;
    for (let i = 0, j = length - 1; i < length; j = i++) {
        const xi = polygon[i * 2];
        const yi = polygon[(i * 2) + 1];
        const xj = polygon[j * 2];
        const yj = polygon[(j * 2) + 1];
        const intersect = ((yi > y) !== (yj > y)) &&
                          (x < ((xj - xi) * ((y - yi) / (yj - yi))) + xi);
        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}
