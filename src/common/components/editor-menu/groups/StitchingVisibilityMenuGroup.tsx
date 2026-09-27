import { Menu } from '@chakra-ui/react'
import { useCommandsContext } from '../../../contexts/CommandsContext'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { useTranslation } from '../../../hooks/useTranslation'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { VisibilityMenuItem } from '../items/VisibilityMenuItem'

export const StitchingVisibilityMenuGroup = () => {
  const { t } = useTranslation()
  const { settings } = useGlobalSettings()
  const { getCommand } = useCommandsContext<CommonCommandIdSchema>()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.view.stitching.name}</Menu.ItemGroupLabel>
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchLinesVisible}
        value={settings.view.stitchLinesVisible}
        command={getCommand('stitch-line-visibility')}
      />
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchHolesVisible}
        value={settings.view.stitchHolesVisible}
        command={getCommand('stitch-hole-visibility')}
      />
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchesVisible}
        value={settings.view.stitchesVisible}
        command={getCommand('stitches-visibility')}
      />
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchCountVisible}
        value={settings.view.stitchCountVisible}
        command={getCommand('stitch-count-visibility')}
      />
    </Menu.ItemGroup>
  )
}
