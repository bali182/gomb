import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiCopy, PiTrash } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { getModelIconByType } from '../../utils/getModelIcon'
import { EditorActionMenuItem } from '../common/EditorActionMenuItem'

type HoleMenuItemProps = {
  onSelect: () => void
}

export const AddHoleStitchLineMenuItem: FC<HoleMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  const Icon = getModelIconByType('component-bounds-stitch-line')
  return (
    <EditorActionMenuItem value="stitch-line" onSelect={onSelect}>
      <Icon />
      <Menu.ItemText>{t.project.editors.actions.holes.addStitching}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const CloneHoleMenuItem: FC<HoleMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="clone" onSelect={onSelect}>
      <PiCopy />
      <Menu.ItemText>{t.project.editors.actions.holes.clone}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const DeleteHoleMenuItem: FC<HoleMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem
      value="delete"
      onSelect={onSelect}
      color="fg.error"
      _hover={{ bg: 'bg.error', color: 'fg.error' }}
    >
      <PiTrash />
      <Menu.ItemText>{t.project.editors.actions.holes.delete}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}
