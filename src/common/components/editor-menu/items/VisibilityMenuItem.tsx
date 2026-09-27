import { Icon, Menu } from '@chakra-ui/react'
import { FC, useCallback, useMemo } from 'react'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { useCommandsContext } from '../../../contexts/CommandsContext'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { MenuShortcut } from '../MenuShortcut'

type VisibilityMenuItemProps = {
  value: boolean
  label: string
  command: CommonCommandIdSchema
}

export const VisibilityMenuItem: FC<VisibilityMenuItemProps> = ({ command: commandId, value, label }) => {
  const { emitCommand, getCommand } = useCommandsContext<CommonCommandIdSchema>()
  const command = useMemo(() => getCommand(commandId), [commandId, getCommand])
  const toggle = useCallback(() => emitCommand(commandId), [commandId, emitCommand])

  return (
    <Menu.Item disabled={command.disabled} onSelect={toggle} value={command.id} closeOnSelect={false}>
      {value ? <PiEye /> : <Icon as={PiEyeSlash} color="fg.muted" />}
      <Menu.ItemText color={value ? undefined : 'fg.muted'} mr="2">
        {label}
      </Menu.ItemText>
      <MenuShortcut command={command} noPadding />
    </Menu.Item>
  )
}
