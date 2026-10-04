import { Icon, Menu } from '@chakra-ui/react'
import { FC, useCallback, useId, useMemo } from 'react'
import type { IconType } from 'react-icons'
import { useCommandsContext } from '../../../contexts/CommandsContext'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { MenuShortcut } from '../MenuShortcut'

type ToggleMenuItemProps = {
  value: boolean
  label: string
  command: CommonCommandIdSchema
  icon: IconType
}

export const ToggleMenuItem: FC<ToggleMenuItemProps> = ({ command: commandId, value, label, icon: ItemIcon }) => {
  const maskId = useId()
  const { emitCommand, getCommand } = useCommandsContext<CommonCommandIdSchema>()
  const command = useMemo(() => getCommand(commandId), [commandId, getCommand])
  const toggle = useCallback(() => emitCommand(commandId), [commandId, emitCommand])

  return (
    <Menu.Item disabled={command.disabled} onSelect={toggle} value={command.id} closeOnSelect={false}>
      <Icon asChild={false} boxSize="1em" viewBox="0 0 256 256" color={value ? undefined : 'fg.muted'}>
        {!value && (
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={256} height={256}>
              <rect width={256} height={256} fill="white" />
              <path d="M48 40L208 216" fill="none" stroke="black" strokeWidth={50} strokeLinecap="round" />
            </mask>
          </defs>
        )}
        <g mask={value ? undefined : `url(#${maskId})`}>
          <ItemIcon size={256} />
        </g>
        {!value && <path d="M48 40L208 216" fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" />}
      </Icon>
      <Menu.ItemText color={value ? undefined : 'fg.muted'} mr="2">
        {label}
      </Menu.ItemText>
      <MenuShortcut command={command} noPadding />
    </Menu.Item>
  )
}
