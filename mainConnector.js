const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('mainConnector', {
  onReceiveVariable: (callback) => {
    ipcRenderer.on('giveChumhandle', (event, chumhandle) => {
      callback(chumhandle);
    });
  },
  toMain: () => ipcRenderer.send('switchToMain'),
  toSettings: () => ipcRenderer.send('switchToSettings'),
  toLogin: () => ipcRenderer.send('switchToLogin'),
  toRegister: () => ipcRenderer.send('switchToRegister'),
  tryRegister: (email, pass, name) => ipcRenderer.send('pythonRegister', email, pass, name),
  loginCheck: (email, pass) => ipcRenderer.send('pythonLoginCheck', email, pass)
});
