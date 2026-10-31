import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import {
  leatherColors,
  pocketItemColors,
  selectionColors,
  stitchHoleColors,
  stitchLineColors,
  strokeColors,
  threadColors,
} from '../../../data/colors'
import { useColors } from '../../../hooks/useColors'
import { useProject } from '../../../hooks/useProject'
import { useProjectOperations } from '../../../hooks/useProjectOperations'
import { useTranslation } from '../../../hooks/useTranslation'
import { ColorPickerMenuItem } from '../items/ColorPickerMenuItem'

export const ColorsMenuGroup: FC = () => {
  const { t } = useTranslation()
  const { project } = useProject()
  const { updateColorSettings } = useProjectOperations()
  const leatherColorValues = useColors(leatherColors)
  const threadColorValues = useColors(threadColors)
  const stitchHoleColorValues = useColors(stitchHoleColors)
  const stitchLineColorValues = useColors(stitchLineColors)
  const strokeColorValues = useColors(strokeColors)
  const selectionColorValues = useColors(selectionColors)
  const pocketItemColorValues = useColors(pocketItemColors)

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.project.colors.name}</Menu.ItemGroupLabel>
      <ColorPickerMenuItem
        modelId={project.id}
        colors={leatherColorValues}
        field="leatherColor"
        label={t.project.menus.project.colors.leatherColor}
        onChange={updateColorSettings}
        value={project.colorSettings.leatherColor}
      />
      <ColorPickerMenuItem
        modelId={project.id}
        colors={strokeColorValues}
        field="strokeColor"
        label={t.project.menus.project.colors.strokeColor}
        onChange={updateColorSettings}
        value={project.colorSettings.strokeColor}
      />
      <ColorPickerMenuItem
        modelId={project.id}
        colors={pocketItemColorValues}
        field="pocketItemColor"
        label={t.project.menus.project.colors.pocketItemColor}
        onChange={updateColorSettings}
        value={project.colorSettings.pocketItemColor}
      />
      <ColorPickerMenuItem
        modelId={project.id}
        colors={stitchHoleColorValues}
        field="stitchHoleColor"
        label={t.project.menus.project.colors.stitchHoleColor}
        onChange={updateColorSettings}
        value={project.colorSettings.stitchHoleColor}
      />
      <ColorPickerMenuItem
        modelId={project.id}
        colors={stitchLineColorValues}
        field="stitchLineColor"
        label={t.project.menus.project.colors.stitchLineColor}
        onChange={updateColorSettings}
        value={project.colorSettings.stitchLineColor}
      />
      <ColorPickerMenuItem
        modelId={project.id}
        colors={threadColorValues}
        field="threadColor"
        label={t.project.menus.project.colors.threadColor}
        onChange={updateColorSettings}
        value={project.colorSettings.threadColor}
      />
      <ColorPickerMenuItem
        modelId={project.id}
        colors={selectionColorValues}
        field="selectionColor"
        label={t.project.menus.project.colors.selectionColor}
        onChange={updateColorSettings}
        value={project.colorSettings.selectionColor}
      />
    </Menu.ItemGroup>
  )
}
