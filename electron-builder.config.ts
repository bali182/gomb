import type { Configuration } from 'electron-builder'
import { FILE_EXTENSION } from './src/common/constants/fileExtension'

const config: Configuration = {
  appId: 'com.gomb.app',
  productName: 'Gomb',
  icon: 'app-icon.svg',
  directories: {
    output: 'release',
  },
  files: ['out/**/*'],
  fileAssociations: {
    ext: FILE_EXTENSION,
    name: 'Gomb',
    role: 'Editor',
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['arm64'],
      },
    ],
    identity: '-',
    hardenedRuntime: false,
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
}

export default config
