import { Menu } from '@chakra-ui/react'
import { type FC } from 'react'
import { PiDownload } from 'react-icons/pi'

import { CommandMenuItem } from '../../../../common/components/editor-menu/items/CommandMenuItem'
import { useTranslation } from '../../../../common/hooks/useTranslation'
import type { WebCommandIdSchema } from '../../../schemas/webCommands'

export const DownloadAppGroup: FC = () => {
  const { t } = useTranslation()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.about.downloadApp.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<WebCommandIdSchema>
        command="download-app"
        icon={PiDownload}
        title={t.project.menus.about.downloadApp.downloadApp}
      />
    </Menu.ItemGroup>
  )
}
