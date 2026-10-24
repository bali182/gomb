import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiSquareSplitHorizontal, PiSquareSplitVertical } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'

type CommonMenuItemProps = {
  onSelect: () => void
}

export const FlipHorizontalMenuItem: FC<CommonMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="flip-horizontal" onSelect={onSelect}>
      <PiSquareSplitHorizontal />
      <Menu.ItemText>{t.project.editors.actions.common.flipHorizontal}</Menu.ItemText>
    </Menu.Item>
  )
}

export const FlipVerticalMenuItem: FC<CommonMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="flip-vertical" onSelect={onSelect}>
      <PiSquareSplitVertical />
      <Menu.ItemText>{t.project.editors.actions.common.flipVertical}</Menu.ItemText>
    </Menu.Item>
  )
}
