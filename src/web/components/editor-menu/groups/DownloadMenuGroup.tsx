import { Menu } from '@chakra-ui/react'
import { type FC } from 'react'
import { PiDownload } from 'react-icons/pi'

import { CommandMenuItem } from '../../../../common/components/editor-menu/items/CommandMenuItem'
import { useTranslation2 } from '../../../../common/hooks/useTranslation2'
import type { WebCommandIdSchema } from '../../../schemas/webCommands'

export const DownloadMenuGroup: FC = () => {
  const { t } = useTranslation2()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.file.download.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<WebCommandIdSchema>
        command="download-project"
        icon={PiDownload}
        title={t.project.menus.file.download.download}
      />
    </Menu.ItemGroup>
  )
}
