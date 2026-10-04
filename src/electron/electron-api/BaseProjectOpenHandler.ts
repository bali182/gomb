import type { BrowserWindow, IpcMain } from 'electron'

import { isDefined } from '../../common/utils/isDefined'
import { electronIpcChannels } from './electronIpcChannels'

export abstract class BaseProjectOpenHandler {
  public abstract readonly shouldQuit: boolean

  private mainWindow: BrowserWindow | undefined
  private pendingFilePath: string | undefined
  private isReactAppReady = false

  protected constructor(private readonly ipcMain: IpcMain) {}

  public initialize(): void {
    this.ipcMain.on(electronIpcChannels.reactAppReady, (event): void => {
      if (
        !isDefined(this.mainWindow) ||
        this.mainWindow.isDestroyed() ||
        event.sender !== this.mainWindow.webContents
      ) {
        return
      }

      this.isReactAppReady = true
      this.sendPendingOpenProject()
    })
  }

  public attachWindow(window: BrowserWindow): void {
    this.mainWindow = window
    this.isReactAppReady = false

    window.webContents.on('did-start-navigation', (details): void => {
      if (details.isMainFrame && !details.isSameDocument) {
        this.isReactAppReady = false
      }
    })

    window.on('closed', (): void => {
      this.mainWindow = undefined
      this.isReactAppReady = false
    })
  }

  protected requestOpenProject(filePath: string): void {
    this.pendingFilePath = filePath
    this.sendPendingOpenProject()
  }

  protected focusWindow(): void {
    if (!isDefined(this.mainWindow) || this.mainWindow.isDestroyed()) {
      return
    }

    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore()
    }

    this.mainWindow.focus()
  }

  private sendPendingOpenProject(): void {
    if (
      !isDefined(this.mainWindow) ||
      this.mainWindow.isDestroyed() ||
      !this.isReactAppReady ||
      !isDefined(this.pendingFilePath)
    ) {
      return
    }

    const filePath = this.pendingFilePath
    this.pendingFilePath = undefined
    this.mainWindow.webContents.send(electronIpcChannels.openProject, filePath)
    this.focusWindow()
  }
}
