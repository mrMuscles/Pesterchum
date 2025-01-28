const electron = require('electron/main');
const WebSocket = require('ws');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, ipcMain } = electron;
const { Notification } = require('electron')
let mainWindow;
const pages = ["mainSite.html", "login.html", "settings.html", "chat.html", "register.html", "pending.html"];
let ws;
let friends = {

}
let friendRequests = {

}

// Listen to ready App
app.on('ready', function(){
  // create new window
  mainWindow = new BrowserWindow({
    //autoHideMenuBar: true,
    //titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, '/mainConnector.js')
    }
    // MAIN WINDOW SIZE 400, 620
    // LOGIN WINDOW SIZE 400, 450
    // SETTINGS WINDOWS SIZE 800, 450
    // CHAT WINDOWS SIZE 700, 505
    // REGISTER WINDOWS SIZE 500, 500
    // PENDING WINDOWS SIZE 800, 450
  });
  mainWindow.setContentSize(400, 620)
  //mainWindow.setSize(400, 700) find better solution to sizing bug after moving application
  //mainWindow.setResizable(false)
  // Load HTML into the new window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, pages[0]),
    protocol: 'file:',
    slashes: true
  }))

  createWebSocketConnection();

  ipcMain.on('switchToMain', () => {
    console.log("SEND TO MAIN SITE!!!")  // ------------ needs to be deleted for production
    mainWindow.loadURL(url.format({
        pathname : path.join(__dirname, pages[0]),
        protocol:'file',
        slashes:true
      }));
      mainWindow.setContentSize(400, 620)
  });

  ipcMain.on('switchToSettings', () => {
    console.log("SEND TO SETTINGS SITE!!!") // ----------- needs to be deleted for production
    mainWindow.loadURL(url.format({
      pathname : path.join(__dirname, pages[2]),
      protocol:'file',
      slashes:true
    }));
    mainWindow.setContentSize(800, 450)
  });

  ipcMain.on('switchToLogin', () => {
    console.log("SEND TO LOGIN SITE!!!") // ----------- needs to be deleted for production
    mainWindow.loadURL(url.format({
      pathname : path.join(__dirname, pages[1]),
      protocol:'file',
      slashes:true
    }));
    mainWindow.setContentSize(400, 450)
  });

  ipcMain.on('switchToRegister', () => {
    console.log("SEND TO REGISTER SITE!!!") // ----------- needs to be deleted for production
    mainWindow.loadURL(url.format({
      pathname : path.join(__dirname, pages[4]),
      protocol:'file',
      slashes:true
    }));
    mainWindow.setContentSize(500, 500)
  });

  ipcMain.on('switchToPending', () => {
    console.log("SEND TO PENDING SITE!!!") // ----------- needs to be deleted for production
    mainWindow.loadURL(url.format({
      pathname : path.join(__dirname, pages[5]),
      protocol:'file',
      slashes:true
    }));
    mainWindow.setContentSize(800, 450)
  });


  ipcMain.on('pythonLoginCheck', (event, email, pass) => {
    console.log("SENDING EMAIL TO PYTHON: " + email)             // both need to be deleted for production
    console.log("SENDING PASS TO PYTHON: " + pass)           // this one as well
    const loginServer = {
      code: 100,
      email: email,
      password: pass
    }
    ws.send(JSON.stringify(loginServer));
  });

  ipcMain.on('pythonRegister', (event, email, pass, name) => {
    console.log("SENDING EMAIL TO PYTHON: " + email)             // both need to be deleted for production
    console.log("SENDING PASS TO PYTHON: " + pass)           // this one as well
    console.log("SENDING NAME TO PYTHON: " + name)
    const registerServer = {
      code: 300,
      email: email,
      password: pass,
      name: name
    }
    ws.send(JSON.stringify(registerServer));
  });

  ipcMain.on('pythonFriendRequest', (event, email) => {
    console.log("SENDING FRIEND REQUEST EMAIL TO PYTHON: " + email)             // both need to be deleted for production
    const loginServer = {
      code: 600,
      email: email,
    }
    ws.send(JSON.stringify(loginServer));
    // maybe add a tab saying like "outgoing friend requests"
    // this is a not a priority but before v1.0
  });

})

function createWebSocketConnection() {
  // Create WebSocket - go back to 413 for real production :(
  ws = new WebSocket("ws://192.168.1.42:1111");

  // Try connecting to Server
  ws.addEventListener("open", () => {
    // send command code 200 with data using JSON
    console.log("Connecting To Server...");  //---------- needs to be deleted for production
    const connectServer = {
      code: 200,
      version: "1.0"
    }
    ws.send(JSON.stringify(connectServer));
  });

  ws.addEventListener('message', function(event) {
    const parsedMessage = JSON.parse(event.data);
    console.log(parsedMessage["code"]);
    if(parsedMessage["code"] == 102) {
      console.log(parsedMessage["username"]);
      console.log(parsedMessage["color"]);
      mainWindow.loadURL(url.format({
          pathname : path.join(__dirname, pages[0]),
          protocol:'file',
          slashes:true
        }));
      mainWindow.setContentSize(400, 620)
      mainWindow.webContents.on('did-finish-load', (event) => {
        mainWindow.webContents.send('giveChumhandle', parsedMessage["username"]);
      })
      console.log(parsedMessage["friends"]);
    }
    if(parsedMessage["code"] == 602) {
      console.log("friend request sent!");
      // at some point make popup saying friend request sent
      // popup should NOT be windows notification
    }
    if(parsedMessage["code"] == 30000) {
      const parsedMessage = JSON.parse(event.data);
      console.log("someone sent you a friend request!");
      console.log(parsedMessage["email"])
      console.log(parsedMessage["username"])
        // send notification to windows saying new friend request
    /*  new Notification({
        title: 'Friend Request!',
        body: parsedMessage["username"].concat(" has sent you a request!"),
        icon: path.join(__dirname, 'images/notification.ico'),
      }).show() */
      // and maybe also have a popup on pesterchum
      // also need to tell pending requests to populate with a new row
    }
    if(parsedMessage["code"] == 603)  {
      const parsedMessage = JSON.parse(event.data);
      console.log("YOU ARE NOW FRIENDS WITH:")
      console.log(parsedMessage["username"])
      // populate friend list with new friend!
    }
    if(parsedMessage["code"] == 30002) {
      // it just means that the server got your request and is creating a friendship
      // this is similar to recieving a 602 response code for sending a friend request
    }
    if(parsedMessage["code"] == 309) {
      // SEND TO LOGIN SITE!
    }
    //  mainWindow.webContents.send('sendSettings', myVariable);
  });

  ws.addEventListener('error', (err) => {
    console.log("201");
    // Should popup with Error Code 201 (meaning cannot connect to server)
  });
}
