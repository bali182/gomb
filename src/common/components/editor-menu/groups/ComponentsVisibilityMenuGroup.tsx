import { Menu } from '@chakra-ui/react'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { useTranslation } from '../../../hooks/useTranslation'
import { ToggleMenuItem } from '../items/ToggleMenuItem'

export const ComponentsVisibilityMenuGroup = () => {
  const { t } = useTranslation()
  const { settings } = useGlobalSettings()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.view.components.name}</Menu.ItemGroupLabel>
      <ToggleMenuItem
        enabledIcon={PiEye}
        disabledIcon={PiEyeSlash}
        label={t.project.menus.view.components.componentDimensionsVisible}
        value={settings.view.componentDimensionsVisible}
        command="component-dimensions-visibility"
      />
    </Menu.ItemGroup>
  )
}
