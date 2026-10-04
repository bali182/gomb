import { contextBridge, ipcRenderer, webUtils, type IpcRendererEvent } from 'electron'
import { ElectronApi } from '../schemas/electronApi'
import { electronIpcChannels } from './electronIpcChannels'

const electronApi: ElectronApi = {
  dialog: (request) => ipcRenderer.invoke(electronIpcChannels.dialog, request),
  findExistingFilePaths: (request) => ipcRenderer.invoke(electronIpcChannels.findExistingFilePaths, request),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  getSettings: () => ipcRenderer.invoke(electronIpcChannels.getSettings),
  openExternal: (url) => ipcRenderer.invoke(electronIpcChannels.openExternal, url),
  read: (request) => ipcRenderer.invoke(electronIpcChannels.read, request),
  reactAppReady: () => ipcRenderer.send(electronIpcChannels.reactAppReady),
  setSettings: (request) => ipcRenderer.invoke(electronIpcChannels.setSettings, request),
  suggestPath: (request) => ipcRenderer.invoke(electronIpcChannels.suggestPath, request),
  validateCreatePath: (request) => ipcRenderer.invoke(electronIpcChannels.validateCreatePath, request),
  write: (request) => ipcRenderer.invoke(electronIpcChannels.write, request),

  onOpenProject: (listener) => {
    const handler = (_event: IpcRendererEvent, filePath: unknown): void => {
      if (typeof filePath === 'string') {
        listener(filePath)
      }
    }

    ipcRenderer.on(electronIpcChannels.openProject, handler)

    return (): void => {
      ipcRenderer.removeListener(electronIpcChannels.openProject, handler)
    }
  },
}

contextBridge.exposeInMainWorld('electronApi', electronApi)
