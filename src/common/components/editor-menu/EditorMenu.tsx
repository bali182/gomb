import { Card, HStack, IconButton, Input, Separator } from '@chakra-ui/react'
import { useCallback, type ChangeEvent, type FC, type ReactElement } from 'react'
import { PiCaretLeft, PiWalletDuotone } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useEditableProject } from '../../hooks/useEditableProject'
import type { ProjectSchema } from '../../schemas/project'
import { isDefined } from '../../utils/isDefined'

type EditorMenuProps = {
  menu: ReactElement
  projects: readonly ProjectSchema[]
}

export const EditorMenu: FC<EditorMenuProps> = ({ menu, projects }) => {
  const { editableProject, setProject, validationIssues } = useEditableProject(projects)
  const { navigateToProjects } = useEditorContext()
  const hasNameError = isDefined(validationIssues.name) && validationIssues.name.severity === 'error'

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      setProject({ ...editableProject, name: event.currentTarget.value })
    },
    [editableProject, setProject],
  )

  const handleNavigateToProjects = useCallback((): void => {
    navigateToProjects()
  }, [navigateToProjects])

  return (
    <>
      <Card.Root>
        <Card.Body padding="2" flexDirection="row" alignItems="center">
          <IconButton onClick={handleNavigateToProjects} size="sm" variant="ghost" mr="1" borderRadius="full">
            <PiCaretLeft />
          </IconButton>
          <HStack gap="1">
            <PiWalletDuotone />
            <Input
              aria-invalid={hasNameError}
              _invalid={{ borderColor: 'border.error', focusRingColor: 'border.error' }}
              borderColor="transparent"
              fieldSizing="content"
              focusRing="inside"
              focusRingColor="colorPalette.focusRing"
              fontWeight="bold"
              onChange={handleNameChange}
              px="1"
              size="sm"
              value={editableProject.name}
              w="auto"
            />
          </HStack>
          <Separator orientation="vertical" height="5" ml="3" mr="3" />
          <HStack gap="1">{menu}</HStack>
        </Card.Body>
      </Card.Root>
    </>
  )
}
