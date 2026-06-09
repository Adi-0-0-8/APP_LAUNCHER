const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  fetchURLs: () => ipcRenderer.invoke('fetch-urls'),
  openURL: (url) => ipcRenderer.invoke('open-url', url),
  togglePin: (appId) => ipcRenderer.invoke('toggle-pin', appId),
  quitApp: () => ipcRenderer.send('quit-app'),
  onServerUrl: (callback) => ipcRenderer.on('server-url', (event, url) => callback(url)),
  onExpanded: (callback) => ipcRenderer.on('expanded', () => callback()),
  onCollapsed: (callback) => ipcRenderer.on('collapsed', () => callback()),
  // Auto-updater functions
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, info) => callback(info)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, percent) => callback(percent)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, info) => callback(info))
});
