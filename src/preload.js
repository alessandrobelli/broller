const {
  contextBridge,
  ipcRenderer
} = require("electron");
require('dotenv').config()

const { createClient } = require('pexels');
const client = createClient(process.env.API_KEY);


// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
  send: (channel, perPage, query = "") => {
    // whitelist channels
    let validChannels = ["toPopular", "toSearch", "toShowMenu"];
    if (validChannels.includes(channel)) {
      let data = {};
      // make the api call to get the videos
      if (query !== "") {
        client.videos.search({ query, per_page: perPage }).then(videos => {
          data = videos['videos'];
          ipcRenderer.send(channel, data);

        });
      } else {
        client.videos.popular({ per_page: perPage }).then(videos => {
          data = videos['videos'];
          ipcRenderer.send(channel, data);
        });
      }


    }
  },
  receive: (channel, func) => {
    let validChannels = ["fromSearch", "fromShowMenu", "fromPopular"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
}
);