const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createClient } = require('pexels');
const client = createClient('***REMOVED***');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "broller",
    icon: path.join(app.getAppPath(), 'Broller.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });
  // Set Window Resizable
  mainWindow.isResizable(true);
  mainWindow.setAspectRatio(16 / 9)
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.focus();
};


app.on('web-contents-created', (e, contents) => {
  contents.on('new-window', (e, url) => {
    e.preventDefault();
    require('open')(url);
  });
  contents.on('will-navigate', (e, url) => {
    if (url !== contents.getURL()) e.preventDefault(), require('open')(url);
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("toPopular", (event, args) => {
  // Do something with file contents
  // Send result back to renderer process
  mainWindow.webContents.send("fromPopular", args);
});
ipcMain.on("toShowMenu", (event, args) => {
  // Do something with file contents
  // Send result back to renderer process
  mainWindow.webContents.send("fromShowMenu", args);
});
ipcMain.on("toSearch", (event, args) => {
  // Do something with file contents
  // Send result back to renderer process
  mainWindow.webContents.send("fromSearch", args);
});