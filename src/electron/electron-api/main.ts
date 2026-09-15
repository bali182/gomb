import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import typia from 'typia'
import { BACKGROUND_COLORS } from '../../common/constants/colors'
import type {
  FileDialogRequestSchema,
  FileFindExistingFilePathsRequestSchema,
  FileReadRequestSchema,
  FileSuggestPathRequestSchema,
  FileValidateCreatePathRequestSchema,
  FileWriteRequestSchema,
  SettingsSetRequestSchema,
} from '../schemas/electronApi'
import { getPreloadPath, getRendererPath } from './buildPaths'
import { createNativeCommandHandler } from './createNativeCommandHandler'
import { _electronApi } from './electronApi'
import { electronIpcChannels } from './electronIpcChannels'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
let mainWindow: BrowserWindow

const createMainWindow = async (): Promise<BrowserWindow> => {
  const settings = await _electronApi.getSettings()
  const browserWindow = new BrowserWindow({
    backgroundColor: BACKGROUND_COLORS[settings.app.theme],
    titleBarStyle: 'default',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: getPreloadPath(currentDirectory),
      sandbox: true,
    },
  })

  browserWindow.webContents.on(
    'before-input-event',
    createNativeCommandHandler({ app, browserWindow, platform: process.platform === 'darwin' ? 'mac' : 'desktop' }),
  )

  const devServerUrl = process.env.ELECTRON_RENDERER_URL

  if (devServerUrl !== undefined) {
    await browserWindow.loadURL(devServerUrl)
  } else {
    await browserWindow.loadFile(getRendererPath(currentDirectory))
  }

  if (process.argv.includes('--devtools')) {
    browserWindow.webContents.openDevTools()
  }

  return browserWindow
}

ipcMain.handle(electronIpcChannels.dialog, (_event, request: unknown) => {
  if (!typia.is<FileDialogRequestSchema>(request)) {
    return { type: 'error' }
  }
  return _electronApi.dialog(request)
})

ipcMain.handle(electronIpcChannels.findExistingFilePaths, (_event, request: unknown) => {
  if (!typia.is<FileFindExistingFilePathsRequestSchema>(request)) {
    return { type: 'error' }
  }
  return _electronApi.findExistingFilePaths(request)
})

ipcMain.handle(electronIpcChannels.read, (_event, request: unknown) => {
  if (!typia.is<FileReadRequestSchema>(request)) {
    return { type: 'error' }
  }
  return _electronApi.read(request)
})

ipcMain.handle(electronIpcChannels.getSettings, () => {
  return _electronApi.getSettings()
})

ipcMain.handle(electronIpcChannels.openExternal, (_event, url: unknown) => {
  if (typeof url !== 'string') {
    throw new Error(`Expected URL string.`)
  }
  return _electronApi.openExternal(url)
})

ipcMain.handle(electronIpcChannels.setSettings, async (_event, request: unknown) => {
  if (!typia.is<SettingsSetRequestSchema>(request)) {
    return { type: 'error' }
  }

  const response = await _electronApi.setSettings(request)

  if (response.type === 'error') {
    return response
  }

  try {
    mainWindow.setBackgroundColor(BACKGROUND_COLORS[response.settings.app.theme])
    return response
  } catch (error) {
    console.error('Unable to set Electron window background color:', error)
    return { type: 'error' }
  }
})

ipcMain.handle(electronIpcChannels.suggestPath, (_event, request: unknown) => {
  if (!typia.is<FileSuggestPathRequestSchema>(request)) {
    return { type: 'error' }
  }
  return _electronApi.suggestPath(request)
})

ipcMain.handle(electronIpcChannels.validateCreatePath, (_event, request: unknown) => {
  if (!typia.is<FileValidateCreatePathRequestSchema>(request)) {
    return { type: 'error' }
  }
  return _electronApi.validateCreatePath(request)
})

ipcMain.handle(electronIpcChannels.write, (_event, request: unknown) => {
  if (!typia.is<FileWriteRequestSchema>(request)) {
    return { type: 'error' }
  }
  return _electronApi.write(request)
})

Menu.setApplicationMenu(null)

app.whenReady().then(async (): Promise<void> => {
  mainWindow = await createMainWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
