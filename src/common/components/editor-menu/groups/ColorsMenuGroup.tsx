import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import {
  cardColors,
  leatherColors,
  selectionColors,
  stitchHoleColors,
  stitchLineColors,
  strokeColors,
  threadColors,
} from '../../../data/colors'
import { useColors } from '../../../hooks/useColors'
import { useProject } from '../../../hooks/useProject'
import { useProjectOperations } from '../../../hooks/useProjectOperations'
import { useTranslation } from '../../../translations/translation'
import { ColorPickerMenuItem } from '../items/ColorPickerMenuItem'

export const ColorsMenuGroup: FC = () => {
  const t = useTranslation()
  const { project } = useProject()
  const { updateColorSettings } = useProjectOperations()
  const leatherColorValues = useColors(leatherColors)
  const threadColorValues = useColors(threadColors)
  const stitchHoleColorValues = useColors(stitchHoleColors)
  const stitchLineColorValues = useColors(stitchLineColors)
  const strokeColorValues = useColors(strokeColors)
  const selectionColorValues = useColors(selectionColors)
  const cardColorValues = useColors(cardColors)

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.editor.menus.project.colors.name}</Menu.ItemGroupLabel>
      <ColorPickerMenuItem
        colors={leatherColorValues}
        field="leatherColor"
        label={t.editor.menus.project.colors.leatherColor}
        onChange={updateColorSettings}
        value={project.colorSettings.leatherColor}
      />
      <ColorPickerMenuItem
        colors={strokeColorValues}
        field="strokeColor"
        label={t.editor.menus.project.colors.strokeColor}
        onChange={updateColorSettings}
        value={project.colorSettings.strokeColor}
      />
      <ColorPickerMenuItem
        colors={cardColorValues}
        field="cardColor"
        label={t.editor.menus.project.colors.cardColor}
        onChange={updateColorSettings}
        value={project.colorSettings.cardColor}
      />
      <ColorPickerMenuItem
        colors={stitchHoleColorValues}
        field="stitchHoleColor"
        label={t.editor.menus.project.colors.stitchHoleColor}
        onChange={updateColorSettings}
        value={project.colorSettings.stitchHoleColor}
      />
      <ColorPickerMenuItem
        colors={stitchLineColorValues}
        field="stitchLineColor"
        label={t.editor.menus.project.colors.stitchLineColor}
        onChange={updateColorSettings}
        value={project.colorSettings.stitchLineColor}
      />
      <ColorPickerMenuItem
        colors={threadColorValues}
        field="threadColor"
        label={t.editor.menus.project.colors.threadColor}
        onChange={updateColorSettings}
        value={project.colorSettings.threadColor}
      />
      <ColorPickerMenuItem
        colors={selectionColorValues}
        field="selectionColor"
        label={t.editor.menus.project.colors.selectionColor}
        onChange={updateColorSettings}
        value={project.colorSettings.selectionColor}
      />
    </Menu.ItemGroup>
  )
}
