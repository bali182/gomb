import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import { PiExport } from 'react-icons/pi'
import { useTranslation } from '../../../hooks/useTranslation'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { CommandMenuItem } from '../items/CommandMenuItem'

export const ExportMenuGroup: FC = () => {
  const { t } = useTranslation()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.file.export.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<CommonCommandIdSchema>
        command="export-svg"
        title={t.project.menus.file.export.svg}
        icon={PiExport}
      />
      <CommandMenuItem<CommonCommandIdSchema>
        command="export-pdf"
        title={t.project.menus.file.export.pdf}
        icon={PiExport}
      />
    </Menu.ItemGroup>
  )
}
