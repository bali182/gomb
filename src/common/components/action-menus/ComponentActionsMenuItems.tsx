import { Menu } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiCopy, PiImage, PiPaintBrushBroad, PiTrash } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import type { ComponentSchema } from '../../schemas/components'
import type { StitchLineSchema } from '../../schemas/stitching'
import { getModelIconByType } from '../../utils/getModelIcon'
import { EditorActionMenuItem } from '../common/EditorActionMenuItem'

type AddComponentMenuItemProps = {
  type: ComponentSchema['type']
  disabled?: boolean
  onSelect: (type: ComponentSchema['type']) => void
}

type AddComponentStitchLineMenuItemProps = {
  type: StitchLineSchema['type']
  disabled?: boolean
  onSelect: (type: StitchLineSchema['type']) => void
}

type ComponentMenuItemProps = {
  onSelect: () => void
}

type ExportComponentPngMenuItemProps = {
  disabled?: boolean
  onSelect: () => Promise<void>
}

export const AddComponentMenuItem: FC<AddComponentMenuItemProps> = ({ type, disabled, onSelect }) => {
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
    <EditorActionMenuItem value={type} disabled={disabled} onSelect={() => onSelect(type)}>
      <Icon />
      <Menu.ItemText>{labels[type]}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const AddHoleMenuItem: FC<ComponentMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  const Icon = getModelIconByType('hole')
  return (
    <EditorActionMenuItem value="hole" onSelect={onSelect}>
      <Icon />
      <Menu.ItemText>{t.project.editors.actions.components.addHole}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const AddComponentStitchLineMenuItem: FC<AddComponentStitchLineMenuItemProps> = ({
  type,
  disabled,
  onSelect,
}) => {
  const { t } = useTranslation()
  const Icon = getModelIconByType(type)

  const handleSelect = useCallback((): void => {
    onSelect(type)
  }, [onSelect, type])

  return (
    <EditorActionMenuItem value={type} disabled={disabled} onSelect={handleSelect}>
      <Icon />
      <Menu.ItemText>
        {type === 't-pocket-stitch-line'
          ? t.project.editors.actions.components.addPocketStitching
          : t.project.editors.actions.components.addStitching}
      </Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const ExportComponentPngMenuItem: FC<ExportComponentPngMenuItemProps> = ({ disabled, onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="export-png" disabled={disabled} onSelect={onSelect}>
      <PiImage />
      <Menu.ItemText>{t.project.editors.actions.components.exportToPng}</Menu.ItemText>
    </Menu.Item>
  )
}

export const CloneComponentMenuItem: FC<ComponentMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="clone" onSelect={onSelect}>
      <PiCopy />
      <Menu.ItemText>{t.project.editors.actions.components.clone}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const CopyPocketSettingsMenuItem: FC<ComponentMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="copy-pocket-settings" onSelect={onSelect}>
      <PiPaintBrushBroad />
      <Menu.ItemText>{t.project.editors.actions.components.copyPocketSettings}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const DeleteComponentMenuItem: FC<ComponentMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem
      value="delete"
      onSelect={onSelect}
      color="fg.error"
      _hover={{ bg: 'bg.error', color: 'fg.error' }}
    >
      <PiTrash />
      <Menu.ItemText>{t.project.editors.actions.components.delete}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}
