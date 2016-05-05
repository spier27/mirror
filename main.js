
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.


// Keep the computer from sleeping
const powerSaveBlocker = require('electron').powerSaveBlocker;
powerSaveBlocker.start('prevent-display-sleep');

// Keeps window from being closed due to JavaScript
var mainWindow = null;

// Quits app when all windows are closed
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Calls when ready to initialize browser window
app.on('ready', function() {

  var browserWindowOptions = {width: 800, height: 600, kiosk:true, autoHideMenuBar:true, darkTheme:true};

  // Generates the BrowserWindow
  mainWindow = new BrowserWindow(browserWindowOptions);

  // Loads index.html into the BrowserWindow
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  
});
