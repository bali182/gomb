import { Menu } from '@chakra-ui/react'
import { type FC } from 'react'
import { PiFloppyDisk, PiFolder } from 'react-icons/pi'

import { CommandMenuItem } from '../../../../common/components/editor-menu/items/CommandMenuItem'
import { useTranslation2 } from '../../../../common/hooks/useTranslation2'
import type { ElectronCommandIdSchema } from '../../../schemas/electronCommands'

export const ElectronFileManagementMenuGroup: FC = () => {
  const { t } = useTranslation2()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.file.file.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<ElectronCommandIdSchema> command="open" icon={PiFolder} title={t.project.menus.file.file.open} />
      <CommandMenuItem<ElectronCommandIdSchema>
        command="save"
        icon={PiFloppyDisk}
        title={t.project.menus.file.file.save}
      />
      <CommandMenuItem<ElectronCommandIdSchema>
        command="save-as"
        icon={PiFloppyDisk}
        title={t.project.menus.file.file.saveAs}
      />
    </Menu.ItemGroup>
  )
}
