import { beforeEach, describe, expect, it, vi } from 'vitest'

const { access, getPath, readFile, showOpenDialog, showSaveDialog, stat, writeFile } = vi.hoisted(() => ({
  access: vi.fn(),
  getPath: vi.fn(),
  readFile: vi.fn(),
  showOpenDialog: vi.fn(),
  showSaveDialog: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
}))

vi.mock('electron', () => ({
  app: { getPath },
  dialog: {
    showOpenDialog,
    showSaveDialog,
  },
  nativeTheme: { shouldUseDarkColors: false },
}))

vi.mock('node:fs', () => ({
  constants: { W_OK: 2 },
}))

vi.mock('node:fs/promises', () => ({
  access,
  readFile,
  stat,
  writeFile,
}))

import { VERSION } from '../../version'
import { _electronApi } from './electronApi'

describe('electronApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('reads a known file path', async () => {
    readFile.mockResolvedValue('{"name":"Example"}')

    await expect(_electronApi.read({ type: 'read', filePath: '/projects/example.json' })).resolves.toEqual({
      type: 'read-succeeded',
      contents: '{"name":"Example"}',
    })
  })

  it('returns a generic error when reading fails', async () => {
    readFile.mockRejectedValue(new Error('Cannot read file'))

    await expect(_electronApi.read({ type: 'read', filePath: '/projects/example.json' })).resolves.toEqual({
      type: 'error',
    })
  })

  it('loads migrated settings without writing them during read', async () => {
    getPath.mockReturnValue('/user-data')
    readFile.mockResolvedValue(JSON.stringify({ app: { theme: 'dark' } }))

    const settings = await _electronApi.getSettings()

    expect(settings.version).toBe(VERSION)
    expect(settings.app.theme).toBe('dark')
    expect(settings.app.splitterSizes).toEqual(['auto', '350px'])
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('writes to a known file path', async () => {
    await expect(
      _electronApi.write({
        type: 'write',
        contents: '{"name":"Example"}',
        filePath: '/projects/example.json',
      }),
    ).resolves.toEqual({ type: 'write-succeeded' })

    expect(writeFile).toHaveBeenCalledWith('/projects/example.json', '{"name":"Example"}', 'utf8')
  })

  it('maps a file-read dialog configuration to Electron options', async () => {
    showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/projects/example.json'] })

    await expect(
      _electronApi.dialog({
        type: 'read',
        target: 'file',
        title: 'Open project',
        message: 'Choose a project file',
        buttonLabel: 'Open',
        defaultPath: '/projects',
        fileFilter: { name: 'Project files', extension: 'project' },
      }),
    ).resolves.toEqual({ type: 'selected', filePath: '/projects/example.json' })

    expect(showOpenDialog).toHaveBeenCalledWith({
      title: 'Open project',
      message: 'Choose a project file',
      buttonLabel: 'Open',
      defaultPath: '/projects',
      filters: [{ name: 'Project files', extensions: ['project'] }],
      properties: ['openFile'],
    })
  })

  it('maps a directory-read dialog configuration to Electron options', async () => {
    showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/projects'] })

    await expect(
      _electronApi.dialog({
        type: 'read',
        target: 'directory',
        title: 'Choose folder',
      }),
    ).resolves.toEqual({ type: 'selected', filePath: '/projects' })

    expect(showOpenDialog).toHaveBeenCalledWith({
      title: 'Choose folder',
      properties: ['openDirectory'],
    })
  })

  it('returns cancelled when a dialog is cancelled', async () => {
    showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] })

    await expect(_electronApi.dialog({ type: 'read', target: 'file' })).resolves.toEqual({ type: 'cancelled' })
  })

  it('maps a write dialog configuration to Electron options', async () => {
    showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/projects/example.project' })

    await expect(
      _electronApi.dialog({
        type: 'write',
        title: 'Save project',
        message: 'Choose a destination',
        buttonLabel: 'Save',
        defaultPath: '/projects/example.project',
        fileFilter: { name: 'Project files', extension: 'project' },
      }),
    ).resolves.toEqual({ type: 'selected', filePath: '/projects/example.project' })

    expect(showSaveDialog).toHaveBeenCalledWith({
      title: 'Save project',
      message: 'Choose a destination',
      buttonLabel: 'Save',
      defaultPath: '/projects/example.project',
      filters: [{ name: 'Project files', extensions: ['project'] }],
    })
  })

  it('returns a generic error when a dialog fails', async () => {
    showSaveDialog.mockRejectedValue(new Error('Dialog failed'))

    await expect(_electronApi.dialog({ type: 'write' })).resolves.toEqual({ type: 'error' })
  })

  it('finds existing file paths', async () => {
    stat.mockImplementation(async (filePath: string) => {
      if (filePath === '/projects/existing.project') {
        return { isFile: () => true }
      }

      const error = new Error('Not found') as Error & { code: string }
      error.code = 'ENOENT'
      throw error
    })

    await expect(
      _electronApi.findExistingFilePaths({
        type: 'find-existing-file-paths',
        filePaths: ['/projects/existing.project', '/projects/missing.project'],
      }),
    ).resolves.toEqual({
      type: 'existing-file-paths',
      filePaths: ['/projects/existing.project'],
    })
  })

  it('suggests a valid file path in the Documents directory', async () => {
    getPath.mockReturnValue('/Users/example/Documents')

    await expect(
      _electronApi.suggestPath({ type: 'suggest-path', fileName: 'A / project?', extension: 'project' }),
    ).resolves.toEqual({
      type: 'suggested-path',
      filePath: '/Users/example/Documents/A - project-.project',
    })
  })

  it('validates an available create path', async () => {
    stat.mockResolvedValueOnce({ isDirectory: () => true })
    stat.mockRejectedValueOnce(createError('ENOENT'))

    await expect(
      _electronApi.validateCreatePath({ type: 'validate-create-path', filePath: '/projects/example.project' }),
    ).resolves.toEqual({ type: 'create-path-available' })

    expect(access).toHaveBeenCalledWith('/projects', 2)
  })

  it('returns existing when the create path already contains a file', async () => {
    stat.mockResolvedValueOnce({ isDirectory: () => true })
    stat.mockResolvedValueOnce({ isFile: () => true })

    await expect(
      _electronApi.validateCreatePath({ type: 'validate-create-path', filePath: '/projects/example.project' }),
    ).resolves.toEqual({ type: 'create-path-existing' })
  })

  it('returns invalid when the create path is not absolute', async () => {
    await expect(
      _electronApi.validateCreatePath({ type: 'validate-create-path', filePath: 'example.project' }),
    ).resolves.toEqual({ type: 'create-path-invalid' })
  })
})

const createError = (code: string): Error & { code: string } => {
  const error = new Error(code) as Error & { code: string }
  error.code = code
  return error
}
