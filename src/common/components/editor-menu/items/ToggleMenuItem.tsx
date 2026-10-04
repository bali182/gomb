import { Icon, Menu } from '@chakra-ui/react'
import { FC, useCallback, useMemo } from 'react'
import type { IconType } from 'react-icons'
import { useCommandsContext } from '../../../contexts/CommandsContext'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { MenuShortcut } from '../MenuShortcut'

type ToggleMenuItemProps = {
  value: boolean
  label: string
  command: CommonCommandIdSchema
  enabledIcon: IconType
  disabledIcon: IconType
}

export const ToggleMenuItem: FC<ToggleMenuItemProps> = ({
  command: commandId,
  value,
  label,
  enabledIcon: EnabledIcon,
  disabledIcon: DisabledIcon,
}) => {
  const { emitCommand, getCommand } = useCommandsContext<CommonCommandIdSchema>()
  const command = useMemo(() => getCommand(commandId), [commandId, getCommand])
  const toggle = useCallback(() => emitCommand(commandId), [commandId, emitCommand])

  return (
    <Menu.Item disabled={command.disabled} onSelect={toggle} value={command.id} closeOnSelect={false}>
      {value ? <EnabledIcon /> : <Icon as={DisabledIcon} color="fg.muted" />}
      <Menu.ItemText color={value ? undefined : 'fg.muted'} mr="2">
        {label}
      </Menu.ItemText>
      <MenuShortcut command={command} noPadding />
    </Menu.Item>
  )
}
