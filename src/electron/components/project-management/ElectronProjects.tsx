import { Box, Button, HStack, Spinner, Stack } from '@chakra-ui/react'
import { useCallback, useState, type FC } from 'react'
import { PiFolder, PiPlus } from 'react-icons/pi'

import { ProjectManagementHeader } from '../../../common/components/project-management/ProjectManagementHeader'
import { RecentProjects } from '../../../common/components/project-management/RecentProjects'
import { useTranslation } from '../../../common/hooks/useTranslation'
import { Loadable } from '../../../common/loadable'
import { useElectronProject } from '../../hooks/useElectronProject'
import { useElectronRecentProjects } from '../../hooks/useElectronRecentProjects'
import { ElectronCreateProjectDialog } from '../ElectronCreateProjectDialog'
import { ElectronProjectItem } from './ElectronProjectItem'

export const ElectronProjects: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const recentProjects = useElectronRecentProjects()
  const { openProject } = useElectronProject()
  const { t } = useTranslation()

  const handleCreateProject = useCallback((): void => {
    setIsCreateDialogOpen(true)
  }, [])

  return (
    <Box bg="bg.emphasized" height="100%" padding="8">
      <Stack align="center" height="100%" justify="center">
        <Stack gap="4" maxWidth="lg" width="100%">
          <ProjectManagementHeader />
          {Loadable.hasValue(recentProjects) ? (
            <RecentProjects ProjectItem={ElectronProjectItem} projects={recentProjects.data}>
              <HStack gap="2" mt="2">
                <Button onClick={handleCreateProject} width="100%" variant="solid" display="flex" flex="1">
                  <PiPlus />
                  {t.projects.buttons.createProject}
                </Button>
                <Button onClick={openProject} width="100%" variant="subtle" display="flex" flex="1">
                  <PiFolder />
                  {t.projects.buttons.openProject}
                </Button>
              </HStack>
            </RecentProjects>
          ) : (
            <Spinner alignSelf="center" />
          )}
        </Stack>
      </Stack>
      <ElectronCreateProjectDialog isOpen={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </Box>
  )
}
