/// <reference path="../lib/p5.global-mode.d.ts" />

const { ipcRenderer } = require('electron');

// Grid display information, updated by main process signals
let grid = {
    // Current mode (square 0, hex 1, none 2) of the grid
    mode: 0,
    // Main scaling value for grid. (Square length, hexagon corner diameter)
    scale: 100,
    // If the app is currently focused
    focused: false
}

function setup() {
    // Don't exactly need a high frame rate for this...
    frameRate(10);
    // Create the canvas as big as the entire window
    createCanvas(displayWidth, displayHeight);
    // Create listeners for main process responses to requests
    createResponseListeners();
}

// Runs every frame
function draw() {
    // Make requests to the main process to update grid info
    updateRequests();
    // Clear the screen
    clear();
    // Checks if the app is the active window
    if (grid.focused) {
        // Draw a background if we're not overlaying something
        // background(255);
        background('rgba(0,200,255, 0.15)');
    }
    // Set drawing settings
    strokeWeight(2);
    noFill();
    // Check what grid to use then draw
    if (grid.mode == 0) {
        squares();
    }
    else if (grid.mode == 1) {
        hexes();
    }
}

function windowResized() {
    resizeCanvas(displayWidth, displayHeight);
}

/**
 * Sends a bunch of requests for updated information to the main
 * process. These are things we need to check over and over.
 */
function updateRequests() {
    // Check whether the window is in focus (ask the Node process)
    ipcRenderer.send('focus-status-request');
    // Ask the main process for the grid mode
    ipcRenderer.send('grid-mode-request');
    // Ask the main process for the grid scale
    ipcRenderer.send('grid-scale-request');
}

function createResponseListeners() {
    // When the Node process sends a focus status, update the FOCUSED variable
    ipcRenderer.on('focus-status-response', (_, status) => {
        grid.focused = status;
    });
    // Main process updates the grid mode
    ipcRenderer.on('grid-mode-response', (_, mode) => {
        grid.mode = mode;
    });
    // Main process updates the grid scale
    ipcRenderer.on('grid-scale-response', (_, scale) => {
        console.log("response received");
        grid.scale = scale;
    });
}

// Draws a square grid
function squares() {
    // Draw horizontal lines
    for (let i = 0; i < height / grid.scale; i++) {
        line(0, i * grid.scale, width, i * grid.scale);
    }
    // Draw vertical lines
    for (let i = 0; i < width / grid.scale; i++) {
        line(i * grid.scale, 0, i * grid.scale, height);
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
    const hex_size = grid.scale / 2;
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
