const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const ElectronPreferences = require('electron-preferences');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;
let childWindow;

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "broller",
    icon: path.join(app.getAppPath(), 'Broller.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nativeWindowOpen: true,
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


const preferences = new ElectronPreferences({
  /**
   * Where should preferences be saved?
   */
  'dataStore': path.resolve(app.getPath('userData'), 'preferences.json'),
  /**
   * Default values.
   */
  'defaults': {
    'notes': {
      'folder': path.resolve(os.homedir(), 'Notes')
    },
    'markdown': {
      'auto_format_links': true,
      'show_gutter': false
    },
    'preview': {
      'show': true
    },
    'drawer': {
      'show': false
    }
  },
  /**
   * The preferences window is divided into sections. Each section has a label, an icon, and one or
   * more fields associated with it. Each section should also be given a unique ID.
   */
  'sections': [
    {
      'id': 'settings',
      'label': 'Settings',
      /**
       * See the list of available icons below.
       */
      'icon': 'settings-gear-63',
      'form': {
        'groups': [
          {
            'label': 'Visual Settings',
            'fields': [
              {
                'label': 'Which window you would like to use?',
                'key': 'visualization',
                'type': 'radio',
                'options': [
                  { 'label': 'Big Images', 'value': 'bigimages' },
                  { 'label': 'List', 'value': 'list' },],
                'help': 'Reload on select.'
              },
              {
                'label': 'Videos per Page',
                'key': 'perPage',
                'type': 'dropdown',
                'options': [
                  { 'label': 10, 'value': 10 },
                  { 'label': 25, 'value': 25 },
                  { 'label': 50, 'value': 50 },
                  { 'label': 100, 'value': 100 },
                ],
                'help': 'Select how many videos you want to load at once.'
              },
            ]
          }
        ]
      }
    }
  ]
});

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

ipcMain.on("VisualSyncToAlpine", (event, args) => {
  // Do something with file contents
  // Send result back to renderer process
  mainWindow.webContents.send("fromVisualSyncToAlpine", args);
});

ipcMain.on("PerPageSyncToAlpine", (event, args) => {
  // Do something with file contents
  // Send result back to renderer process
  mainWindow.webContents.send("fromPerPageSyncToAlpine", args);
});

ipcMain.on("openWindow", (event, args) => {

  if(childWindow === undefined)
  {
  childWindow = new BrowserWindow({
    title: "VIDEO",
    icon: path.join(app.getAppPath(), 'Broller.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });
    // set to undefined
    childWindow.on('close', () => {
      childWindow = undefined;
    });

    // set to undefined
    childWindow.on('closed', () => {
      childWindow = undefined;
    });


  // Set Window Resizable
  childWindow.isResizable(true);
  childWindow.setAspectRatio(16 / 9)
  // and load the index.html of the app.
    childWindow.focus();
  childWindow.loadURL(args);
  }else{
    childWindow.focus();
    childWindow.loadURL(args);
  }
});
