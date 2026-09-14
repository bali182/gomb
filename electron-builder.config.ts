import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.gomb.app',
  productName: 'Gomb',
  icon: 'app-icon.svg',
  directories: {
    output: 'release',
  },
  files: ['out/**/*'],
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['arm64'],
      },
    ],
    identity: null,
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
