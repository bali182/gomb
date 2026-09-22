import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { ElectronApi } from '../schemas/electronApi'
import { electronIpcChannels } from './electronIpcChannels'

const electronApi: ElectronApi = {
  dialog: (request) => ipcRenderer.invoke(electronIpcChannels.dialog, request),
  findExistingFilePaths: (request) => ipcRenderer.invoke(electronIpcChannels.findExistingFilePaths, request),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  getSettings: () => ipcRenderer.invoke(electronIpcChannels.getSettings),
  openExternal: (url) => ipcRenderer.invoke(electronIpcChannels.openExternal, url),
  read: (request) => ipcRenderer.invoke(electronIpcChannels.read, request),
  setSettings: (request) => ipcRenderer.invoke(electronIpcChannels.setSettings, request),
  suggestPath: (request) => ipcRenderer.invoke(electronIpcChannels.suggestPath, request),
  validateCreatePath: (request) => ipcRenderer.invoke(electronIpcChannels.validateCreatePath, request),
  write: (request) => ipcRenderer.invoke(electronIpcChannels.write, request),
}

contextBridge.exposeInMainWorld('electronApi', electronApi)
