const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const macOS = process.platform === 'darwin';
var WINDOW_FOCUSED = false;

// Function to create the app window when ready
function createWindow() {
    // Basic configuration for the app window
    const win = new BrowserWindow({
        // Don't show at first (we need to maximize first)
        show: false,
        // This window should be see through
        transparent: true,
        // No frame for the window, it just takes up space
        // frame: false,
        // Allows for communication between main.js and draw.js (main process & renderer)
        // This is unsafe if we were loading remote content, but we aren't, so its fine
        // even if SO yells at us for it.
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    // Take up as much of the screen as possible
    win.maximize();
    // Show the window
    win.show();
    // Run our P5js sketch (found in html)
    win.loadFile("index.html");
    // Always show over the top of other apps using "screen saver" mode
    win.setAlwaysOnTop(true, "screen-saver");
    // Always be visible, even in other workspaces
    win.setVisibleOnAllWorkspaces(true);
    // Ensures that the app doesn't block mouse clicks and the computer
    // can still be navigated
    win.setIgnoreMouseEvents(true);
    // Updates whether the window is currently focused
    win.on('focus', () => {
        WINDOW_FOCUSED = true;
    })
    win.on('blur', () => {
        WINDOW_FOCUSED = false;
    })
    // A shortcut to toggle focus on the grid
    globalShortcut.register('Shift+Alt+G', () => {
        if (!WINDOW_FOCUSED) {
            win.show();
            win.focus();
        }
        else {
            win.blur();
        }
    });
}

// Waits until the app's process is ready
app.whenReady().then(() => {
    // Create the browser window that renders grids
    createWindow();
    // Make sure if the app is being opened, but has no windows (such as
    // after being closed on Mac) that a new window is created
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

// Event runs when all windows of the app have been closed
app.on('window-all-closed', function () {
    // App should exit on everything but Mac
    // Mac keeps apps open even when their windows are gone
    if (!macOS) app.quit();
});

// Handle communication with the renderer
ipcMain.on('asynchronous-message', (event, message, arg) => {
    // Renderer may wish to know if the window is focused
    if (message == "am I focused?") {
        event.sender.send('asynchronous-reply', 'focus status', WINDOW_FOCUSED);
    }
})

// If on Mac, we must hide from the dock to show over fullscreen apps
if (macOS)
    app.dock.hide();
