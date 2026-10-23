import { Box, IconButton, Menu, Portal, type IconButtonProps } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useNavigate } from 'react-router'

import { ActionsMenuSection } from '../../common/components/action-menus/ActionsMenuSection'
import { portalRef } from '../../common/portalRef'
import { useProjects } from '../hooks/useProjects'
import { webAppRoutes } from '../webAppRoutes'
import { DeleteProjectMenuItem } from './ProjectActionsMenuItems'

type ProjectActionsMenuProps = {
  projectId: string
  size: IconButtonProps['size']
}

export const ProjectActionsMenu: FC<ProjectActionsMenuProps> = ({ size, projectId }) => {
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
              <ActionsMenuSection>
                <DeleteProjectMenuItem onSelect={handleDelete} />
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}
