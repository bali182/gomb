import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import { PiArrowClockwise, PiArrowCounterClockwise } from 'react-icons/pi'

import { useTranslation2 } from '../../../hooks/useTranslation2'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { CommandMenuItem } from '../items/CommandMenuItem'

export const UndoRedoMenuGroup: FC = () => {
  const { t } = useTranslation2()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.edit.history.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<CommonCommandIdSchema>
        command="undo"
        title={t.project.menus.edit.history.undo}
        icon={PiArrowCounterClockwise}
      />
      <CommandMenuItem<CommonCommandIdSchema>
        command="redo"
        title={t.project.menus.edit.history.redo}
        icon={PiArrowClockwise}
      />
    </Menu.ItemGroup>
  )
}
