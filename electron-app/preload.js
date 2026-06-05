const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  fetchURLs: () => ipcRenderer.invoke('fetch-urls'),
  openURL: (url) => ipcRenderer.invoke('open-url', url),
  expandWindow: () => ipcRenderer.send('expand-window'),
  collapseWindow: () => ipcRenderer.send('collapse-window'),
  quitApp: () => ipcRenderer.send('quit-app'),
  onServerUrl: (callback) => ipcRenderer.on('server-url', (event, url) => callback(url))
});
