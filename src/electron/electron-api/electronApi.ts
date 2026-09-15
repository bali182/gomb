import { ElectronApi } from '../schemas/electronApi'
import { dialog } from './methods/dialog'
import { findExistingFilePaths } from './methods/findExistingFilePaths'
import { getSettings } from './methods/getSettings'
import { openExternal } from './methods/openExternal'
import { read } from './methods/read'
import { setSettings } from './methods/setSettings'
import { suggestPath } from './methods/suggestPath'
import { validateCreatePath } from './methods/validateCreatePath'
import { write } from './methods/write'

export const _electronApi: ElectronApi = {
  dialog,
  findExistingFilePaths,
  getSettings,
  openExternal,
  read,
  setSettings,
  suggestPath,
  validateCreatePath,
  write,
}
