import { Menu } from '@chakra-ui/react'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { useTranslation } from '../../../hooks/useTranslation'
import { VisibilityMenuItem } from '../items/VisibilityMenuItem'

export const ComponentsVisibilityMenuGroup = () => {
  const { t } = useTranslation()
  const { settings } = useGlobalSettings()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.view.components.name}</Menu.ItemGroupLabel>
      <VisibilityMenuItem
        label={t.project.menus.view.components.componentDimensionsVisible}
        value={settings.view.componentDimensionsVisible}
        command="component-dimensions-visibility"
      />
    </Menu.ItemGroup>
  )
}
