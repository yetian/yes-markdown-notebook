import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import fs from 'fs'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 600,
    minHeight: 300,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // here defines the file operations
  // the following operations will be defined:
  // - open and load a md file
  // - save a new md file
  // - save an exsiting md file
  // - (tbd) save as a new md file
  // - (tbd) open a new folder

  ipcMain.handle('save-new-md-file', async (event, content) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Markdown File',
        defaultPath: 'untitled.md',
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      })
      if (!canceled && filePath) {
        fs.writeFile(filePath, content, 'utf-8', (err) => {
          if (err) {
            console.error('Failed to save file:', err)
          } else {
            console.log('File saved successfully:', filePath)
            return filePath
          }
        })
      }
    } catch (err) {
      console.error('Failed to save file:', err)
    }
    // return the file path
    return undefined
  })

  ipcMain.handle('open-md-file', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Open Markdown File',
        properties: ['openFile'],
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      })
      if (!canceled && filePaths) {
        const content = fs.readFileSync(filePaths[0], 'utf-8')
        return {
          filePath: filePaths[0],
          content: content
        }
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
    console.log('No file selected.')
    return undefined
  })

  ipcMain.handle('save-existing-md-file', (event, contentObj) => {
    try {
      fs.writeFileSync(contentObj.filePath, contentObj.content, 'utf-8')
      console.log('File saved successfully:', contentObj.filePath)
      return true
    } catch (err) {
      console.error('Failed to save file:', err)
    }
    return false
  })

  const mainWindow = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
