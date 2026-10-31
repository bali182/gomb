import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiSquareSplitHorizontal, PiSquareSplitVertical } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { EditorActionMenuItem } from '../common/EditorActionMenuItem'

type CommonMenuItemProps = {
  onSelect: () => void
}

export const FlipHorizontalMenuItem: FC<CommonMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="flip-horizontal" onSelect={onSelect}>
      <PiSquareSplitHorizontal />
      <Menu.ItemText>{t.project.editors.actions.common.flipHorizontal}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const FlipVerticalMenuItem: FC<CommonMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="flip-vertical" onSelect={onSelect}>
      <PiSquareSplitVertical />
      <Menu.ItemText>{t.project.editors.actions.common.flipVertical}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}
