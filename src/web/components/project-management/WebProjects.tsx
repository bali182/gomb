import { Box, Button, Stack } from '@chakra-ui/react'
import { useCallback, useState, type FC } from 'react'
import { PiPlus } from 'react-icons/pi'

import { ProjectManagementHeader } from '../../../common/components/project-management/ProjectManagementHeader'
import { RecentProjects } from '../../../common/components/project-management/RecentProjects'
import { useTranslation2 } from '../../../common/hooks/useTranslation2'
import { useWebRecentProjects } from '../../hooks/useWebRecentProjects'
import { WebCreateProjectDialog } from '../WebCreateProjectDialog'
import { WebProjectItem } from './WebProjectItem'

export const WebProjects: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const recentProjects = useWebRecentProjects()
  const { t } = useTranslation2()

  const openCreateDialog = useCallback((): void => {
    setIsCreateDialogOpen(true)
  }, [])

  return (
    <Box bg="bg.emphasized" height="100%" padding="8">
      <Stack align="center" height="100%" justify="center">
        <Stack gap="4" maxWidth="lg" width="100%">
          <ProjectManagementHeader />
          <RecentProjects ProjectItem={WebProjectItem} projects={recentProjects}>
            <Button onClick={openCreateDialog} width="100%" mt="2" variant="solid">
              <PiPlus />
              {t.projects.buttons.createProject}
            </Button>
          </RecentProjects>
        </Stack>
      </Stack>

      <WebCreateProjectDialog isOpen={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </Box>
  )
}
