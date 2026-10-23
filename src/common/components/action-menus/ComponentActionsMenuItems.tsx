import { Menu } from '@chakra-ui/react'
import { useMemo, type FC } from 'react'
import { PiCopy, PiImage, PiTrash } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import type { ComponentSchema } from '../../schemas/components'
import type { StitchLineSchema } from '../../schemas/stitching'
import { getModelIconByType } from '../../utils/getModelIcon'

type AddComponentMenuItemProps = {
  type: ComponentSchema['type']
  onSelect: (type: ComponentSchema['type']) => void
}

type AddComponentStitchLineMenuItemProps = {
  type: StitchLineSchema['type']
  onSelect: (type: StitchLineSchema['type']) => void
}

type ComponentMenuItemProps = {
  onSelect: () => void
}

type ExportComponentPngMenuItemProps = {
  onSelect: () => Promise<void>
}

export const AddComponentMenuItem: FC<AddComponentMenuItemProps> = ({ type, onSelect }) => {
  const { t } = useTranslation()
  const Icon = getModelIconByType(type)
  const labels = useMemo<Record<ComponentSchema['type'], string>>(
    () => ({
      'front-pocket': t.project.editors.actions.components.addFrontPocket,
      't-pocket': t.project.editors.actions.components.addTPocket,
      panel: t.project.editors.actions.components.addPanel,
      'root-panel': t.project.editors.actions.components.addRootPanel,
      'pocket-cluster': t.project.editors.actions.components.addPocketCluster,
    }),
    [t],
  )
  return (
    <Menu.Item value={type} onSelect={() => onSelect(type)}>
      <Icon />
      <Menu.ItemText>{labels[type]}</Menu.ItemText>
    </Menu.Item>
  )
}

export const AddHoleMenuItem: FC<ComponentMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  const Icon = getModelIconByType('hole')
  return (
    <Menu.Item value="hole" onSelect={onSelect}>
      <Icon />
      <Menu.ItemText>{t.project.editors.actions.components.addHole}</Menu.ItemText>
    </Menu.Item>
  )
}

export const AddComponentStitchLineMenuItem: FC<AddComponentStitchLineMenuItemProps> = ({ type, onSelect }) => {
  const { t } = useTranslation()
  const Icon = getModelIconByType(type)
  return (
    <Menu.Item value={type} onSelect={() => onSelect(type)}>
      <Icon />
      <Menu.ItemText>{t.project.editors.actions.components.addStitching}</Menu.ItemText>
    </Menu.Item>
  )
}

export const ExportComponentPngMenuItem: FC<ExportComponentPngMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="export-png" onSelect={onSelect}>
      <PiImage />
      <Menu.ItemText>{t.project.editors.actions.components.exportToPng}</Menu.ItemText>
    </Menu.Item>
  )
}

export const CloneComponentMenuItem: FC<ComponentMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="clone" onSelect={onSelect}>
      <PiCopy />
      <Menu.ItemText>{t.project.editors.actions.components.clone}</Menu.ItemText>
    </Menu.Item>
  )
}

export const DeleteComponentMenuItem: FC<ComponentMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="delete" onSelect={onSelect} color="fg.error" _hover={{ bg: 'bg.error', color: 'fg.error' }}>
      <PiTrash />
      <Menu.ItemText>{t.project.editors.actions.components.delete}</Menu.ItemText>
    </Menu.Item>
  )
}
