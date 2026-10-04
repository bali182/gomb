import type { Configuration } from 'electron-builder'
import { resolve } from 'node:path'
import { FILE_EXTENSION } from './src/common/constants/fileExtension'

const config: Configuration = {
  appId: 'com.gomb.app',
  productName: 'Gomb',
  icon: 'app-icon.svg',
  directories: {
    output: 'release',
  },
  files: ['out/**/*', '!out/document-icons/**/*'],
  mac: {
    extraResources: [{ from: 'out/document-icons/Assets.car', to: 'Assets.car' }],
    extendInfo: {
      UTExportedTypeDeclarations: [
        {
          UTTypeIdentifier: 'com.gomb.project',
          UTTypeDescription: 'Gomb',
          UTTypeConformsTo: ['public.json'],
          UTTypeTagSpecification: { 'public.filename-extension': [FILE_EXTENSION] },
          UTTypeIcons: { UTTypeIconBadgeName: 'GombDocumentLogo' },
        },
      ],
      CFBundleDocumentTypes: [
        {
          CFBundleTypeName: 'Gomb',
          CFBundleTypeRole: 'Editor',
          LSHandlerRank: 'Default',
          LSItemContentTypes: ['com.gomb.project'],
        },
      ],
    },
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
    fileAssociations: {
      ext: FILE_EXTENSION,
      name: 'Gomb',
      role: 'Editor',
      icon: resolve('out/document-icons/gomb.ico'),
    },
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
