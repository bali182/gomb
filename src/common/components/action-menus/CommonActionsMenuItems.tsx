import { Menu, type SystemStyleObject } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiCopy, PiSquareSplitHorizontal, PiSquareSplitVertical, PiTrash } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { EditorActionMenuItem } from '../common/EditorActionMenuItem'

type CommonMenuItemProps = {
  disabled?: boolean
  onSelect: () => void
}

const deleteHoverStyle: SystemStyleObject = { bg: 'bg.error', color: 'fg.error' }

export const CloneMenuItem: FC<CommonMenuItemProps> = ({ disabled, onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="clone" disabled={disabled} onSelect={onSelect}>
      <PiCopy />
      <Menu.ItemText>{t.project.editors.actions.common.clone}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const DeleteMenuItem: FC<CommonMenuItemProps> = ({ disabled, onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem
      value="delete"
      disabled={disabled}
      onSelect={onSelect}
      color="fg.error"
      _hover={deleteHoverStyle}
    >
      <PiTrash />
      <Menu.ItemText>{t.project.editors.actions.common.delete}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const FlipHorizontalMenuItem: FC<CommonMenuItemProps> = ({ disabled, onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="flip-horizontal" disabled={disabled} onSelect={onSelect}>
      <PiSquareSplitHorizontal />
      <Menu.ItemText>{t.project.editors.actions.common.flipHorizontal}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

export const FlipVerticalMenuItem: FC<CommonMenuItemProps> = ({ disabled, onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="flip-vertical" disabled={disabled} onSelect={onSelect}>
      <PiSquareSplitVertical />
      <Menu.ItemText>{t.project.editors.actions.common.flipVertical}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}
