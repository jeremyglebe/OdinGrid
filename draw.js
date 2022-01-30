const { ipcRenderer } = require('electron');

// Main scaling value for grid. (Square length,
// hexagon corner-to-corner diameter)
var PX_SCALE = 100;
// Current mode (square 0, hex 1, none 2) of the grid
var GRID_MODE = 0;
// Determines if the window is currently focused
var FOCUSED = false;
// Amount that the grid scale changes each time a
// zoom button is pressed
const ZOOM_INC = 10;

function setup() {
    // Don't exactly need a high frame rate for this...
    frameRate(10);
    // Create the canvas as big as the entire window
    createCanvas(displayWidth, displayHeight);
}

// Runs every frame
function draw() {
    // Check whether the window is in focus (ask the Node process)
    ipcRenderer.send('focus-status-request');
    // Clear the screen
    clear();
    // Checks if the app is the active window
    if (FOCUSED) {
        // Draw a background if we're not overlaying something
        // background(255);
        background('rgba(0,200,255, 0.15)');
    }
    // Set drawing settings
    strokeWeight(2);
    noFill();
    // Check what grid to use then draw
    if (GRID_MODE == 0) {
        squares();
    }
    else if (GRID_MODE == 1) {
        hexes();
    }
}

function keyPressed() {
    // Toggle the grid mode when pressing G
    if (key == 'g') {
        GRID_MODE = (GRID_MODE + 1) % 3;
    }
    // Zoom in/out using +(=) and -
    if (key == '=') {
        PX_SCALE += ZOOM_INC;
    }
    else if (key == '-' && PX_SCALE - ZOOM_INC > 0) {
        PX_SCALE -= ZOOM_INC;
    }
}

// Draws a square grid
function squares() {
    // Draw horizontal lines
    for (let i = 0; i < height / PX_SCALE; i++) {
        line(0, i * PX_SCALE, width, i * PX_SCALE);
    }
    // Draw vertical lines
    for (let i = 0; i < width / PX_SCALE; i++) {
        line(i * PX_SCALE, 0, i * PX_SCALE, height);
    }
}

// Draws a hexagonal grid. Very messy and bad code but it works.
// Reference for placing hexagons:
// https://www.redblobgames.com/grids/hexagons/
// (Using flat hexagons, not pointy)
function hexes() {
    // For drawing regular polygon, number of sides
    const sides = 6;
    // Radius "size" of the regular hexagon
    const hex_size = PX_SCALE / 2;
    // Calculated height of the regular hexagon
    const hex_height = Math.sqrt(3) * hex_size;
    // Calculated width of the regular hexagon
    const hex_width = 2 * hex_size;
    // Place the hexagons, starting a bit off screen and ending a bit off screen
    for (let r = -1; r < height / hex_height * 1.5; r++) {
        for (let c = -1; c < width / hex_width * 1.5; c++) {
            // Calculate the x coordinate
            const x = c * .75 * hex_width;
            // Calculate the y coordinate (changes on even/odd rows)
            const y = c % 2 ? r * hex_height : r * hex_height + hex_height / 2;
            // Draw the hexagon with regular polygon function
            polygon(x, y, hex_size, sides);
        }
    }
}

// Draws a regular polygon
// Retrieved from here:
// https://p5js.org/examples/form-regular-polygon.html
function polygon(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

// When the Node process sends a focus status, update the FOCUSED variable
ipcRenderer.on('focus-status-response', (_, status) => {
    FOCUSED = status;
});