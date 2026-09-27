import { Menu } from '@chakra-ui/react'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { useTranslation } from '../../../hooks/useTranslation'
import { VisibilityMenuItem } from '../items/VisibilityMenuItem'

export const StitchingVisibilityMenuGroup = () => {
  const { t } = useTranslation()
  const { settings } = useGlobalSettings()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.view.stitching.name}</Menu.ItemGroupLabel>
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchLinesVisible}
        value={settings.view.stitchLinesVisible}
        command="stitch-line-visibility"
      />
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchHolesVisible}
        value={settings.view.stitchHolesVisible}
        command="stitch-hole-visibility"
      />
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchesVisible}
        value={settings.view.stitchesVisible}
        command="stitches-visibility"
      />
      <VisibilityMenuItem
        label={t.project.menus.view.stitching.stitchCountVisible}
        value={settings.view.stitchCountVisible}
        command="stitch-count-visibility"
      />
    </Menu.ItemGroup>
  )
}
