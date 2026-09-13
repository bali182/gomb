import { App, BrowserWindow, Event, Input } from 'electron'
import type { BasicKeyEventSchema } from '../../common/schemas/command'
import type { PlatformSchema } from '../../common/schemas/platform'
import { isDefined } from '../../common/utils/isDefined'
import { matchesShortcut } from '../../common/utils/matchesShortcut'
import { nativeElectronCommands } from './nativeElectronCommands'

type NativeCommandHandlerParams = {
  browserWindow: BrowserWindow
  app: App
  platform: PlatformSchema
}

export const createNativeCommandHandler =
  ({ app, browserWindow, platform }: NativeCommandHandlerParams) =>
  (_event: Event, input: Input): void => {
    if (input.type !== 'keyDown') {
      return
    }

    const baseKeyEvent: BasicKeyEventSchema = {
      altKey: input.alt,
      code: input.code,
      ctrlKey: input.control,
      key: input.key,
      metaKey: input.meta,
      shiftKey: input.shift,
    }

    const command = nativeElectronCommands.find((candidate) =>
      matchesShortcut(candidate.shortcut, baseKeyEvent, platform),
    )

    if (!isDefined(command)) {
      return
    }

    switch (command.id) {
      case 'copy':
        return browserWindow.webContents.copy()
      case 'paste':
        return browserWindow.webContents.paste()
      case 'cut':
        return browserWindow.webContents.cut()
      case 'close-window':
        return browserWindow.close()
      case 'quit':
        return app.quit()
      case 'devtools':
        return browserWindow.webContents.toggleDevTools()
      case 'select-all':
        browserWindow.webContents.selectAll()
    }
  }
