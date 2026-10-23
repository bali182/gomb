import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiCopy, PiSquareSplitHorizontal, PiSquareSplitVertical, PiTrash } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'

type StitchLineMenuItemProps = {
  onSelect: () => void
}

export const FlipStitchLineHorizontalMenuItem: FC<StitchLineMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="flip-horizontal" onSelect={onSelect}>
      <PiSquareSplitHorizontal />
      <Menu.ItemText>{t.project.editors.actions.stitchLines.flipHorizontal}</Menu.ItemText>
    </Menu.Item>
  )
}

export const FlipStitchLineVerticalMenuItem: FC<StitchLineMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="flip-vertical" onSelect={onSelect}>
      <PiSquareSplitVertical />
      <Menu.ItemText>{t.project.editors.actions.stitchLines.flipVertical}</Menu.ItemText>
    </Menu.Item>
  )
}

export const CloneStitchLineMenuItem: FC<StitchLineMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="clone" onSelect={onSelect}>
      <PiCopy />
      <Menu.ItemText>{t.project.editors.actions.stitchLines.clone}</Menu.ItemText>
    </Menu.Item>
  )
}

export const DeleteStitchLineMenuItem: FC<StitchLineMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="delete" onSelect={onSelect} color="fg.error" _hover={{ bg: 'bg.error', color: 'fg.error' }}>
      <PiTrash />
      <Menu.ItemText>{t.project.editors.actions.stitchLines.delete}</Menu.ItemText>
    </Menu.Item>
  )
}
