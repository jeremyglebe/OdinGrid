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

// Listen to keypresses
document.addEventListener('keydown', keyPressed);

/**
 * Pressing keys in this window sends messages to the main process.
 * The main process will then propagate changes to the grid window.
 */
function keyPressed(event) {
    const key = event.key;
    // Toggle the grid mode when pressing G
    if (key == 'g') {
        toggleGrid();
    }
    // Zoom in/out using +(=) and -
    if (key == '=' || key == '+') {
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
        document.querySelector("#scale").innerText = `${grid.scale}`;
        ipcRenderer.send('grid-scale-alert', grid.scale);
    }
}