import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical, PiTrash } from 'react-icons/pi'
import { useNavigate } from 'react-router'

import { useTranslation } from '../../common/hooks/useTranslation'
import { portalRef } from '../../common/portalRef'
import { useProjects } from '../hooks/useProjects'
import { webAppRoutes } from '../webAppRoutes'

type ProjectActionsMenuProps = {
  projectId: string
  size: IconButtonProps['size']
}

export const ProjectActionsMenu: FC<ProjectActionsMenuProps> = ({ size, projectId }) => {
  const { t } = useTranslation()
  const { deleteProject } = useProjects()
  const navigate = useNavigate()

  const handleActionsClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleDelete = useCallback((): void => {
    deleteProject(projectId)
    navigate(webAppRoutes.projects)
  }, [deleteProject, navigate, projectId])

  return (
    <Box onClick={handleActionsClick}>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton size={size} variant="ghost">
            <PiDotsThreeVertical />
          </IconButton>
        </Menu.Trigger>
        <Portal container={portalRef}>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item
                onSelect={handleDelete}
                value="delete"
                color="fg.error"
                _hover={{ bg: 'bg.error', color: 'fg.error' }}
              >
                <PiTrash />
                <Menu.ItemText>{t.projects.actions.delete}</Menu.ItemText>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
