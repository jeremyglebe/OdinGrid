/// <reference path="../lib/p5.global-mode.d.ts" />

const { ipcRenderer } = require('electron');
// Map from mode numbers to names
const G_MODES = ["Square", "Hex", "None"];
// Amount that the grid scale changes each time a zoom button is pressed
const ZOOM_INC = 10;

// Grid display information
let grid = {
    /** Current mode (square 0, hex 1, none 2) of the grid */
    mode: 0,
    scale: 100
}

function setup() {
    createCanvas(600, 600);
    // Create a button to toggle the grid mode
    createButton('Toggle Grid Mode [G]').position(15, 30).mousePressed(toggleGrid);
    // Zoom buttons
    createButton('Zoom Out [-]').position(15, 130).mousePressed(() => updateGridScale(-ZOOM_INC));
    createButton('Zoom In [+]').position(260, 130).mousePressed(() => updateGridScale(ZOOM_INC));
}

function draw() {
    // Black background (Dark mode forever)
    background(0);
    // Our font size will be 24px
    textSize(24);
    textAlign(LEFT, TOP);
    // Prepare to draw on background with white
    fill(255);
    // Display the current grid mode
    text(`Grid Mode: ${G_MODES[grid.mode]}`, 270, 36);
    // Display current zoom level
    text("Zoom Level", 150, 95);
    text(`${grid.scale}`, 190, 140);
}

/**
 * Pressing keys in this window sends messages to the main process.
 * The main process will then propagate changes to the grid window.
 */
function keyPressed() {
    // Toggle the grid mode when pressing G
    if (key == 'g') {
        toggleGrid();
    }
    // Zoom in/out using +(=) and -
    if (key == '=') {
        updateGridScale(ZOOM_INC);
    }
    else if (key == '-') {
        updateGridScale(-ZOOM_INC);
    }
}

function toggleGrid() {
    grid.mode = (grid.mode + 1) % 3;
    ipcRenderer.send("grid-mode-alert", grid.mode);
}

function updateGridScale(amount) {
    if (grid.scale + amount > 0) {
        grid.scale += amount;
        ipcRenderer.send('grid-scale-alert', grid.scale);
    }
}