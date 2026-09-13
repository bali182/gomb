import { Icon, Menu } from '@chakra-ui/react'
import { FC, useCallback } from 'react'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { useCommandsContext } from '../../../contexts/CommandsContext'
import { CommandSchema, CommonCommandIdSchema } from '../../../schemas/command'
import { MenuShortcut } from '../MenuShortcut'

type StitchVisibilityMenuItemProps = {
  value: boolean
  label: string
  command: CommandSchema<CommonCommandIdSchema>
}

export const StitchVisibilityMenuItem: FC<StitchVisibilityMenuItemProps> = ({ command, value, label }) => {
  const { emitCommand } = useCommandsContext<CommonCommandIdSchema>()
  const toggle = useCallback(() => emitCommand(command.id), [command.id, emitCommand])

  return (
    <Menu.Item disabled={command.disabled} onSelect={toggle} value={command.id} closeOnSelect={false}>
      {value ? <PiEye /> : <Icon as={PiEyeSlash} color="fg.muted" />}
      <Menu.ItemText mr="2">{label}</Menu.ItemText>
      <MenuShortcut command={command} noPadding />
    </Menu.Item>
  )
}
