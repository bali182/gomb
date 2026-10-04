import type { App, IpcMain } from 'electron'

import type { BaseProjectOpenHandler } from './BaseProjectOpenHandler'
import { MacProjectOpenHandler } from './MacProjectOpenHandler'
import { WindowsProjectOpenHandler } from './WindowsProjectOpenHandler'

type CreateProjectFileOpenHandlerParams = {
  app: App
  ipcMain: IpcMain
}

export const createProjectFileOpenHandler = ({
  app,
  ipcMain,
}: CreateProjectFileOpenHandlerParams): BaseProjectOpenHandler => {
  switch (process.platform) {
    case 'win32':
      return new WindowsProjectOpenHandler(app, ipcMain)
    case 'darwin':
      return new MacProjectOpenHandler(app, ipcMain)
    default:
      throw new Error(`Unsupported project opening platform: ${process.platform}`)
  }
}
