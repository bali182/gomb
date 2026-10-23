import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiCopy, PiTrash } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { getModelIcon } from '../../utils/getModelIcon'

type HoleMenuItemProps = {
  onSelect: () => void
}

export const AddHoleStitchLineMenuItem: FC<HoleMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  const Icon = getModelIcon('component-bounds-stitch-line')
  return (
    <Menu.Item value="stitch-line" onSelect={onSelect}>
      <Icon />
      <Menu.ItemText>{t.project.editors.actions.holes.addStitching}</Menu.ItemText>
    </Menu.Item>
  )
}

export const CloneHoleMenuItem: FC<HoleMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="clone" onSelect={onSelect}>
      <PiCopy />
      <Menu.ItemText>{t.project.editors.actions.holes.clone}</Menu.ItemText>
    </Menu.Item>
  )
}

export const DeleteHoleMenuItem: FC<HoleMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="delete" onSelect={onSelect} color="fg.error" _hover={{ bg: 'bg.error', color: 'fg.error' }}>
      <PiTrash />
      <Menu.ItemText>{t.project.editors.actions.holes.delete}</Menu.ItemText>
    </Menu.Item>
  )
}
