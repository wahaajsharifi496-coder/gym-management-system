const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('licenseApi', {
  activate: key => ipcRenderer.invoke('license:activate', key)
});
