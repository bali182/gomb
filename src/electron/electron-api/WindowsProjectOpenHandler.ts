import type { App, IpcMain } from 'electron'
import { win32 } from 'node:path'

import { isDefined } from '../../common/utils/isDefined'
import { BaseProjectOpenHandler } from './BaseProjectOpenHandler'

export class WindowsProjectOpenHandler extends BaseProjectOpenHandler {
  private isSecondaryInstance = false

  public constructor(
    private readonly app: App,
    ipcMain: IpcMain,
  ) {
    super(ipcMain)
  }

  public get shouldQuit(): boolean {
    return this.isSecondaryInstance
  }

  public override initialize(): void {
    this.isSecondaryInstance = !this.app.requestSingleInstanceLock()

    if (this.shouldQuit) {
      return
    }

    super.initialize()

    this.app.on('second-instance', (_event, argv: string[]): void => {
      const filePath = this.getOpenProjectFilePath(argv)

      if (isDefined(filePath)) {
        this.requestOpenProject(filePath)
      } else {
        this.focusWindow()
      }
    })

    const filePath = this.getOpenProjectFilePath(process.argv)

    if (isDefined(filePath)) {
      this.requestOpenProject(filePath)
    }
  }

  private getOpenProjectFilePath(argv: string[]): string | undefined {
    const excluded = [process.execPath, this.app.getAppPath()]
    const normalizedExcluded = excluded.map((filePath): string => win32.normalize(filePath).toLowerCase())

    const filePaths = argv
      .filter((argument) => !argument.startsWith('-'))
      .filter((argument) => win32.isAbsolute(argument) && win32.parse(argument).root.length > 1)
      .filter((argument) => !normalizedExcluded.includes(win32.normalize(argument).toLowerCase()))

    return filePaths[filePaths.length - 1]
  }
}
