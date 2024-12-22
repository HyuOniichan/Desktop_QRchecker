const { contextBridge, ipcRenderer } = require('electron'); 

contextBridge.exposeInMainWorld('electronAPI', {
    toggleRunning: (isRun) => ipcRenderer.send('toggle-running', isRun), 
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, running) => callback(running))
}); 
