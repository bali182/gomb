import type { App, IpcMain } from 'electron'

import { BaseProjectOpenHandler } from './BaseProjectOpenHandler'

export class MacProjectOpenHandler extends BaseProjectOpenHandler {
  public readonly shouldQuit = false

  public constructor(
    private readonly app: App,
    ipcMain: IpcMain,
  ) {
    super(ipcMain)
  }

  public override initialize(): void {
    super.initialize()

    this.app.on('open-file', (event, filePath: string): void => {
      event.preventDefault()
      this.requestOpenProject(filePath)
    })
  }
}
