import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiTrash } from 'react-icons/pi'

import { useTranslation } from '../../common/hooks/useTranslation'

type DeleteProjectMenuItemProps = {
  onSelect: () => void
}

export const DeleteProjectMenuItem: FC<DeleteProjectMenuItemProps> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Menu.Item value="delete" onSelect={onSelect} color="fg.error" _hover={{ bg: 'bg.error', color: 'fg.error' }}>
      <PiTrash />
      <Menu.ItemText>{t.projects.actions.delete}</Menu.ItemText>
    </Menu.Item>
  )
}
