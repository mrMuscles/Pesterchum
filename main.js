const electron = require('electron/main');
const WebSocket = require('ws');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, ipcMain } = electron;
let mainWindow;
const pages = ["mainSite.html", "login.html", "settings.html", "chat.html", "register.html"];
let ws;

// Listen to ready App
app.on('ready', function(){
  // create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, '/mainConnector.js')
    }
    // MAIN WINDOW SIZE 400, 620
    // LOGIN WINDOW SIZE 400, 450
    // SETTINGS WINDOWS SIZE 800, 450
    // CHAT WINDOWS SIZE 700, 505
    // REGISTER WINDOWS SIZE 500, 500
  });
  mainWindow.setContentSize(400, 450)
  //mainWindow.setSize(400, 700) find better solution to sizing bug after moving application
  mainWindow.setResizable(false)
  // Load HTML into the new window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, pages[1]),
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


  ipcMain.on('pythonLoginCheck', (event, email, pass) => {
    console.log("SENDING EMAIL TO PYTHON: " + email)             // both need to be deleted for production
    console.log("SENDING PASS TO PYTHON: " + pass)           // this one as well
    // same thing here use JSON to send code#, email and password
    //ws.send("100")
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
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('giveChumhandle', parsedMessage["username"]);
      })
    }
    //if(parsedMessage["code"] == 309) {

  //  }
    //  mainWindow.webContents.send('sendSettings', myVariable);
  });

  ws.addEventListener('error', (err) => {
    console.log("201");
    // Should popup with Error Code 201 (meaning cannot connect to server)
  });
}
