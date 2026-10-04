import { Menu } from '@chakra-ui/react'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { useTranslation } from '../../../hooks/useTranslation'
import { ToggleMenuItem } from '../items/ToggleMenuItem'

export const StitchingVisibilityMenuGroup = () => {
  const { t } = useTranslation()
  const { settings } = useGlobalSettings()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.view.stitching.name}</Menu.ItemGroupLabel>
      <ToggleMenuItem
        enabledIcon={PiEye}
        disabledIcon={PiEyeSlash}
        label={t.project.menus.view.stitching.stitchLinesVisible}
        value={settings.view.stitchLinesVisible}
        command="stitch-line-visibility"
      />
      <ToggleMenuItem
        enabledIcon={PiEye}
        disabledIcon={PiEyeSlash}
        label={t.project.menus.view.stitching.stitchHolesVisible}
        value={settings.view.stitchHolesVisible}
        command="stitch-hole-visibility"
      />
      <ToggleMenuItem
        enabledIcon={PiEye}
        disabledIcon={PiEyeSlash}
        label={t.project.menus.view.stitching.stitchHoleFootprintVisible}
        value={settings.view.stitchHoleFootprintVisible}
        command="stitch-hole-footprint-visibility"
      />
      <ToggleMenuItem
        enabledIcon={PiEye}
        disabledIcon={PiEyeSlash}
        label={t.project.menus.view.stitching.stitchesVisible}
        value={settings.view.stitchesVisible}
        command="stitches-visibility"
      />
      <ToggleMenuItem
        enabledIcon={PiEye}
        disabledIcon={PiEyeSlash}
        label={t.project.menus.view.stitching.stitchCountVisible}
        value={settings.view.stitchCountVisible}
        command="stitch-count-visibility"
      />
    </Menu.ItemGroup>
  )
}
