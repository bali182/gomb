import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
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
