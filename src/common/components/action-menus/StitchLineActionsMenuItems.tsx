import { Menu, SystemStyleObject } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiCopy, PiTrash } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { EditorActionMenuItem } from '../common/EditorActionMenuItem'

type StitchLineMenuItemProps = {
  onSelect: () => void
}

export const CloneStitchLineMenuItem: FC<StitchLineMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="clone" onSelect={onSelect}>
      <PiCopy />
      <Menu.ItemText>{t.project.editors.actions.stitchLines.clone}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}

const deleteHoverStyle: SystemStyleObject = { bg: 'bg.error', color: 'fg.error' }

export const DeleteStitchLineMenuItem: FC<StitchLineMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="delete" onSelect={onSelect} color="fg.error" _hover={deleteHoverStyle}>
      <PiTrash />
      <Menu.ItemText>{t.project.editors.actions.stitchLines.delete}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}
