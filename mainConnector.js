const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('mainConnector', {
  onReceiveVariable: (callback) => {
    ipcRenderer.on('giveChumhandle', (event, chumhandle) => {
      console.log(chumhandle);
      callback(chumhandle);
    });
  },
  toMain: () => ipcRenderer.send('switchToMain'),
  toSettings: () => ipcRenderer.send('switchToSettings'),
  toLogin: () => ipcRenderer.send('switchToLogin'),
  toRegister: () => ipcRenderer.send('switchToRegister'),
  toPending: () => ipcRenderer.send('switchToPending'),
  tryRegister: (email, pass, name) => ipcRenderer.send('pythonRegister', email, pass, name),
  loginCheck: (email, pass) => ipcRenderer.send('pythonLoginCheck', email, pass),
  addFriend: (email) => ipcRenderer.send('pythonFriendRequest', email)
});
