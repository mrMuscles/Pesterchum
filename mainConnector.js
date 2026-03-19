const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('mainConnector', {
  onReceiveVariable: (callback) => {
    ipcRenderer.on('giveChumhandle', (event, chumhandle) => {
      console.log(chumhandle);
      callback(chumhandle);
    });
  },
  onReceiveFriendsList: (callback) => ipcRenderer.on('giveFriendsList', (event, friends) => callback(friends)),
  onReceiveNewFriend: (callback) => ipcRenderer.on('newFriend', (event, username) => callback(username)),
  onReceiveFriendRequests: (callback) => ipcRenderer.on('giveFriendRequests', (event, requests) => callback(requests)),
  onReceiveNewFriendRequest: (callback) => ipcRenderer.on('newFriendRequest', (event, username) => callback(username)),
  toMain: () => ipcRenderer.send('switchToMain'),
  toSettings: () => ipcRenderer.send('switchToSettings'),
  toLogin: () => ipcRenderer.send('switchToLogin'),
  toRegister: () => ipcRenderer.send('switchToRegister'),
  toPending: () => ipcRenderer.send('switchToPending'),
  tryRegister: (email, pass, name) => ipcRenderer.send('pythonRegister', email, pass, name),
  loginCheck: (email, pass) => ipcRenderer.send('pythonLoginCheck', email, pass),
  addFriend: (email) => ipcRenderer.send('pythonFriendRequest', email)
});
