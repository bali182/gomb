import type { HasTypeSchema } from '../../common/schemas/common'
import type { GlobalSettingsSchema } from '../../common/schemas/settings'

export type NativePlatformSchema =
  | 'aix'
  | 'android'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'openbsd'
  | 'sunos'
  | 'win32'
  | 'cygwin'
  | 'netbsd'

export type FileCancelledResponseSchema = HasTypeSchema<'cancelled'>

export type FileErrorResponseSchema = HasTypeSchema<'error'>

export type FileReadRequestSchema = HasTypeSchema<'read'> & {
  filePath: string
}

export type FileReadSucceededResponseSchema = HasTypeSchema<'read-succeeded'> & {
  contents: string
}

export type FileReadResponseSchema = FileReadSucceededResponseSchema | FileErrorResponseSchema

export type FileWriteRequestSchema = HasTypeSchema<'write'> & {
  contents: string
  filePath: string
}

export type FileWriteSucceededResponseSchema = HasTypeSchema<'write-succeeded'>

export type FileWriteResponseSchema = FileWriteSucceededResponseSchema | FileErrorResponseSchema

export type FileDialogPresentationSchema = {
  buttonLabel?: string
  defaultPath?: string
  message?: string
  title?: string
}

export type FileDialogFileFilterSchema = {
  extension: string
  name: string
}

export type FileDialogFileReadRequestSchema = HasTypeSchema<'read'> &
  FileDialogPresentationSchema & {
    fileFilter?: FileDialogFileFilterSchema
    target: 'file'
  }

export type FileDialogDirectoryReadRequestSchema = HasTypeSchema<'read'> &
  FileDialogPresentationSchema & {
    target: 'directory'
  }

export type FileDialogReadRequestSchema = FileDialogFileReadRequestSchema | FileDialogDirectoryReadRequestSchema

export type FileDialogWriteRequestSchema = HasTypeSchema<'write'> &
  FileDialogPresentationSchema & {
    fileFilter?: FileDialogFileFilterSchema
  }

export type FileDialogRequestSchema = FileDialogReadRequestSchema | FileDialogWriteRequestSchema

export type FileDialogSelectedResponseSchema = HasTypeSchema<'selected'> & {
  filePath: string
}

export type FileDialogResponseSchema =
  | FileDialogSelectedResponseSchema
  | FileCancelledResponseSchema
  | FileErrorResponseSchema

export type FileFindExistingFilePathsRequestSchema = HasTypeSchema<'find-existing-file-paths'> & {
  filePaths: string[]
}

export type FileExistingFilePathsResponseSchema = HasTypeSchema<'existing-file-paths'> & {
  filePaths: string[]
}

export type FileFindExistingFilePathsResponseSchema = FileExistingFilePathsResponseSchema | FileErrorResponseSchema

export type FileSuggestPathRequestSchema = HasTypeSchema<'suggest-path'> & {
  extension: string
  fileName: string
}

export type FileSuggestedPathResponseSchema = HasTypeSchema<'suggested-path'> & {
  filePath: string
}

export type FileSuggestPathResponseSchema = FileSuggestedPathResponseSchema | FileErrorResponseSchema

export type FileValidateCreatePathRequestSchema = HasTypeSchema<'validate-create-path'> & {
  filePath: string
}

export type FileCreatePathAvailableResponseSchema = HasTypeSchema<'create-path-available'>

export type FileCreatePathExistingResponseSchema = HasTypeSchema<'create-path-existing'>

export type FileCreatePathInvalidResponseSchema = HasTypeSchema<'create-path-invalid'>

export type FileValidateCreatePathResponseSchema =
  | FileCreatePathAvailableResponseSchema
  | FileCreatePathExistingResponseSchema
  | FileCreatePathInvalidResponseSchema
  | FileErrorResponseSchema

export type SettingsSetRequestSchema = HasTypeSchema<'settings-set'> & {
  settings: GlobalSettingsSchema
}

export type SettingsSetSucceededResponseSchema = HasTypeSchema<'settings-set-succeeded'> & {
  settings: GlobalSettingsSchema
}

export type SettingsSetResponseSchema = SettingsSetSucceededResponseSchema | FileErrorResponseSchema

export type ElectronApi = {
  dialog: (request: FileDialogRequestSchema) => Promise<FileDialogResponseSchema>
  findExistingFilePaths: (
    request: FileFindExistingFilePathsRequestSchema,
  ) => Promise<FileFindExistingFilePathsResponseSchema>
  getSettings: () => Promise<GlobalSettingsSchema>
  openExternal: (url: string) => Promise<void>
  read: (request: FileReadRequestSchema) => Promise<FileReadResponseSchema>
  setSettings: (request: SettingsSetRequestSchema) => Promise<SettingsSetResponseSchema>
  suggestPath: (request: FileSuggestPathRequestSchema) => Promise<FileSuggestPathResponseSchema>
  validateCreatePath: (request: FileValidateCreatePathRequestSchema) => Promise<FileValidateCreatePathResponseSchema>
  write: (request: FileWriteRequestSchema) => Promise<FileWriteResponseSchema>
}
