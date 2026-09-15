import { Menu } from '@chakra-ui/react'
import { FC, useMemo } from 'react'
import { CommandSchema } from '../../schemas/command'
import { formatShortcut } from '../../utils/formatShortcut'
import { isDefined } from '../../utils/isDefined'
import { PLATFORM } from '../../utils/platform'

type MenuShortcutProps = {
  command: CommandSchema<unknown>
  noPadding?: boolean
}

export const MenuShortcut: FC<MenuShortcutProps> = ({ command, noPadding }) => {
  const shortcut = useMemo<string | undefined>(() => {
    if (!isDefined(command.shortcut)) {
      return undefined
    }
    return formatShortcut(command.shortcut, PLATFORM)
  }, [command.shortcut])

  if (!isDefined(shortcut)) {
    return null
  }
  return <Menu.ItemCommand {...(noPadding ? { paddingInlineStart: 0 } : {})}>{shortcut}</Menu.ItemCommand>
}
