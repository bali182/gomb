import { HStack, IconButton, Tabs } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'

import { PiPlus, PiWalletDuotone } from 'react-icons/pi'
import { useEditorContext } from '../contexts/EditorContext'
import { useProject } from '../hooks/useProject'
import { useProjectOperations } from '../hooks/useProjectOperations'
import { accessors } from '../utils/accessors'
import { ComponentActionsMenu } from './ComponentActionsMenu'

export const EditorSubProjectTabs: FC = () => {
  const { project } = useProject()
  const { createSubProject } = useProjectOperations()
  const { navigateToSubProject, subProject } = useEditorContext()

  const handleSubProjectClick = useCallback(
    (subProjectId: string): void => {
      navigateToSubProject(subProjectId)
    },
    [navigateToSubProject],
  )

  const handleCreateSubProject = useCallback((): void => {
    const subProject = createSubProject()
    navigateToSubProject(subProject.id)
  }, [createSubProject, navigateToSubProject])

  return (
    <Tabs.Root size="sm" value={subProject?.id} variant="subtle" width="100%">
      <Tabs.List _before={{ borderBottomColor: 'bg.panel' }} alignItems="center">
        {project.subProjects.map((subProject) => {
          const rootPanel = accessors.subProject(subProject).rootPanel()
          return (
            <HStack gap="0" key={subProject.id}>
              <Tabs.Trigger
                as="div"
                _selected={{ bg: { _dark: 'gray.700', base: 'gray.300' } }}
                onClick={() => handleSubProjectClick(subProject.id)}
                pr="2"
                value={subProject.id}
                borderRadius="0"
              >
                <PiWalletDuotone /> {rootPanel.name}
                <ComponentActionsMenu size="2xs" component={rootPanel} subProjectOnly={true} subProject={subProject} />
              </Tabs.Trigger>
            </HStack>
          )
        })}
        <IconButton size="xs" variant="ghost" ml="2" onClick={handleCreateSubProject}>
          <PiPlus />
        </IconButton>
      </Tabs.List>
    </Tabs.Root>
  )
}
