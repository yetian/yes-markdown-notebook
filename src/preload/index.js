import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  saveNewMDFile: (content) => ipcRenderer.invoke('save-new-md-file', content),
  openMDFile: () => ipcRenderer.invoke('open-md-file'),
  // contentObj: { filePath: string, content: string }
  saveExistingMDFile: (contentObj) => ipcRenderer.invoke('save-existing-md-file', contentObj)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
