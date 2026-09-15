export const electronIpcChannels = {
  dialog: 'file-management:dialog',
  findExistingFilePaths: 'file-management:find-existing-file-paths',
  getSettings: 'settings:get',
  openExternal: 'shell:open-external',
  read: 'file-management:read',
  setSettings: 'settings:set',
  suggestPath: 'file-management:suggest-path',
  validateCreatePath: 'file-management:validate-create-path',
  write: 'file-management:write',
} as const
