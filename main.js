const { app, BrowserWindow, shell } = require('electron')

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 550,
    height: 100,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  const url = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './dist/main/index.html'),
    protocol: 'file:',
    slashes: true
  });

  console.log(`starting app with url: ${url}`)
  win.loadURL(url);

  win.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault()

    let result = deviceList.find((device) => {
      return device.deviceName.includes('Desk')
    })

    if (!result) {
      callback('Sorry, could not find a desk.')
    } else {
      callback(result.deviceId)
    }
  })

  // Open the DevTools.
  // win.webContents.openDevTools()
}

app.commandLine.appendSwitch('enable-experimental-web-platform-features')

app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
