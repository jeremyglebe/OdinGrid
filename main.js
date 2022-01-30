const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const DEBUG = false;
const IS_MAC = process.platform === 'darwin';

// Represents the game grid
let grid = {
    /** @type {BrowserWindow} */
    window: null,
    focused: false,
    mode: 0,
    scale: 100
}

// Represents the control panel for the grid
let panel = {
    /** @type {BrowserWindow} */
    window: null,
    focused: false
}

function create() {
    // Create the grid and then the control panel
    createGrid();
    createPanel();
}

function createGrid() {
    /**
     * @type {Electron.BrowserWindowConstructorOptions} 
     * Configure the grid's window
    */
    const config = {
        // Don't show at first
        show: false,
        // This window should be see through
        transparent: DEBUG ? false : true,
        // No frame for the window, it just takes up space
        frame: DEBUG ? true : false,
        // Allows for communication between main.js and draw.js (main process & renderer)
        // This is unsafe if we were loading remote content, but we aren't, so its fine
        // even if SO yells at us for it.
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    };
    // Create the grid's window
    grid.window = new BrowserWindow(config);
    // Maximize the grid window size, then show it
    grid.window.maximize();
    grid.window.show();
    // Load the HTML which displays the P5js grid sketch
    grid.window.loadFile("grid/index.html");
    // Always show over the top of other apps using "screen saver" mode
    grid.window.setAlwaysOnTop(true, "screen-saver");
    // Always be visible, even in other workspaces
    grid.window.setVisibleOnAllWorkspaces(true);
    // Ensures that the app doesn't block mouse clicks and the computer
    // can still be navigated
    if (!DEBUG) grid.window.setIgnoreMouseEvents(true);
    // Events to set focused/unfocused state
    grid.window.on('focus', () => { grid.focused = true; });
    grid.window.on('blur', () => { grid.focused = false; });
}

function createPanel() {
    /** @type {Electron.BrowserWindowConstructorOptions} */
    const config = {
        width: 600,
        height: 600,
        // Don't show at first
        show: false,
        // Same note as above... Lets communication happen
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    };
    panel.window = new BrowserWindow(config);
    // Show the window
    panel.window.show();
    // Load the HTML which displays the P5js grid sketch
    panel.window.loadFile("panel/index.html");
    // Events to set focused/unfocused state
    panel.window.on('focus', () => { grid.focused = true; });
    panel.window.on('blur', () => { grid.focused = false; });
    // If we close the panel, we close the grid
    panel.window.on('close', () => {
        grid.window.close();
    });
}

/**
 * Creates listeners for events on the electron app
 */
function appListen() {
    // If the app is activated but has not windows open (possible when
    // re-opening on MacOS) then we should rebuild the windows
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) create()
    });
    // When the windows are closed, app should exit on everything but Mac
    app.on('window-all-closed', function () {
        if (!IS_MAC) app.quit();
    });
}

/**
 * Creates listeners for messages from the renderer
 */
function docListen() {
    // The grid wants to know if the app's windows are focused
    ipcMain.on('focus-status-request', focusStatusResponse);
    // The grid wants to know what the grid mode is
    ipcMain.on('grid-mode-request', gridModeResponse);
    // The panel wants to alert the app that the grid mode has changed
    ipcMain.on('grid-mode-alert', gridModeUpdate);
    // Grid scale
    ipcMain.on('grid-scale-request', gridScaleResponse);
    ipcMain.on('grid-scale-alert', gridScaleUpdate);
}

function focusStatusResponse(event) {
    event.sender.send('focus-status-response', grid.focused || panel.focused);
}

function gridModeResponse(event) {
    event.sender.send('grid-mode-response', grid.mode);
}

function gridScaleResponse(event) {
    event.sender.send('grid-scale-response', grid.scale);
}

function gridModeUpdate(_, mode) {
    grid.mode = mode;
}

function gridScaleUpdate(_, scale) {
    grid.scale = scale;
}

// Start code fired asynchronously for this script
(async () => {
    // Wait until the app is ready before creating windows
    await app.whenReady();
    // Fire the create method first to build everything
    create();
    // Create various listeners on the electron app
    appListen();
    // Listen for messages from the HTML documents
    docListen();
    // If on Mac, we must hide from the dock to show over fullscreen apps
    // (Is this actually true???)
    if (IS_MAC)
        app.dock.hide();
})();

// A shortcut to toggle focus on the grid
// globalShortcut.register('Shift+Alt+G', () => {
//     if (!WINDOW_FOCUSED) {
//         win.show();
//         win.focus();
//     }
//     else {
//         win.blur();
//     }
// });