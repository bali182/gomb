import { shell } from 'electron'

export const openExternal = async (url: string): Promise<void> => {
  if (!url.startsWith('https://')) {
    throw new Error(`Only HTTPS URLs can be opened externally.`)
  }

  await shell.openExternal(url)
}
