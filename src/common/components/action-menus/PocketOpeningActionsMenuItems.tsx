import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiStar } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { EditorActionMenuItem } from '../common/EditorActionMenuItem'

type PocketOpeningMenuItemProps = {
  disabled?: boolean
  onSelect: () => void
}

export const SetDefaultPocketOpeningMenuItem: FC<PocketOpeningMenuItemProps> = ({ disabled, onSelect }) => {
  const { t } = useTranslation()
  return (
    <EditorActionMenuItem value="set-default" disabled={disabled} onSelect={onSelect}>
      <PiStar />
      <Menu.ItemText>{t.project.editors.actions.pocketOpenings.setDefault}</Menu.ItemText>
    </EditorActionMenuItem>
  )
}
