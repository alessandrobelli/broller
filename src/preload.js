const {
  contextBridge,
  ipcRenderer,
  remote
} = require("electron");
require('dotenv').config()

require('alpinejs');

const { createClient } = require('pexels');
const client = createClient(process.env.API_KEY);
ipcRenderer.on('preferencesUpdated', (e, preferences) => {
  ipcRenderer.send("VisualSyncToAlpine", preferences.settings.visualization)
  ipcRenderer.send("PerPageSyncToAlpine", preferences.settings.perPage)
});
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, query = "") => {
      if (channel === "openWindow"){
        ipcRenderer.send(channel, query);
      }
    // whitelist channels
    let validChannels = ["toPopular", "toSearch", "toShowMenu"];
    if (validChannels.includes(channel)) {
      const preferences = ipcRenderer.sendSync("getPreferences")
      let data = {};
      // make the api call to get the videos
      if (query !== "") {
        client.videos.search({ query, per_page: parseInt(preferences.settings.perPage) }).then(videos => {
          data = videos['videos'];
          ipcRenderer.send(channel, data);

        });
      } else {
        client.videos.popular({ per_page: parseInt(preferences.settings.perPage) }).then(videos => {
          data = videos['videos'];
          ipcRenderer.send(channel, data);
        });
      }
    }

    if (channel === "toShowPrefs") {
      ipcRenderer.send('showPreferences');
    } else if (channel === "syncPreferences") {
      const preferences = ipcRenderer.sendSync('getPreferences');
      ipcRenderer.send("VisualSyncToAlpine", preferences.settings.visualization)
      ipcRenderer.send("PerPageSyncToAlpine", preferences.settings.perPage)

    }

  },
  receive: (channel, func) => {
    let validChannels = ["fromSearch", "fromShowMenu", "fromPopular", "fromVisualSyncToAlpine", "fromPerPageSyncToAlpine"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
}
);