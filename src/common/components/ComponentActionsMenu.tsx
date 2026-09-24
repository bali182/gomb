import { Box, IconButton, IconButtonProps, Menu, Portal } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { PiCopy, PiDotsThreeVertical, PiTrash } from 'react-icons/pi'
import { useEditorContext } from '../contexts/EditorContext'
import { useOptionalSubProject } from '../hooks/useOptionalSubProject'
import { useProject } from '../hooks/useProject'
import { useProjectOperations } from '../hooks/useProjectOperations'
import { useSubProjectOperations } from '../hooks/useSubProjectOperations'
import { useTranslation } from '../hooks/useTranslation'
import { portalRef } from '../portalRef'
import type { HasComponentTargetSchema, HasTargetSchema } from '../schemas/common'
import type { ComponentSchema } from '../schemas/components'
import type { StitchLineSchema } from '../schemas/stitching'
import { SubProjectSchema } from '../schemas/subProject'
import { getModelIcon } from '../utils/getModelIcon'
import { isDefined } from '../utils/isDefined'
import { noop } from '../utils/noop'

type ComponentActionsProps = {
  component: ComponentSchema
  subProject: SubProjectSchema
  subProjectOnly?: boolean
  size: IconButtonProps['size']
  onAddChild?: (target: HasComponentTargetSchema, type: ComponentSchema['type']) => void
  onAddHole?: (target: HasComponentTargetSchema) => void
  onAddStitchLine?: (target: HasTargetSchema, type: StitchLineSchema['type']) => void
  onDelete?: (componentId: string) => void
}

export const ComponentActionsMenu: FC<ComponentActionsProps> = ({
  component,
  size,
  subProject,
  subProjectOnly,
  onAddChild = noop,
  onAddHole = noop,
  onAddStitchLine = noop,
  onDelete = noop,
}) => {
  const { t } = useTranslation()
  const { project } = useProject()
  const { subProject: selectedSubProject } = useOptionalSubProject()
  const { cloneSubProject, deleteSubProject } = useProjectOperations()
  const { addComponent, addHole, addStitchLineToComponent, cloneComponent, deleteComponent } = useSubProjectOperations()
  const { navigateToProject, navigateToSubProject } = useEditorContext()
  const nextSelectedSubProjectAfterDelete = useMemo((): SubProjectSchema | undefined => {
    // No subproject selected, we won't select any. This shouldn't happen as /projects/id autoselects a subproject if there are any.
    if (!isDefined(selectedSubProject?.id)) {
      return undefined
    }
    // We are not deleting the same subproject as the selected one, preserve the selected one.
    if (selectedSubProject.id !== subProject.id) {
      return selectedSubProject
    }
    const subProjectIndex = project.subProjects.findIndex((candidate) => candidate.id === selectedSubProject.id)
    if (project.subProjects.length === 1 && project.subProjects[0] === selectedSubProject) {
      return undefined
    }
    return subProjectIndex === 0 ? project.subProjects[1] : project.subProjects[subProjectIndex - 1]
  }, [project.subProjects, selectedSubProject, subProject.id])

  const deleteRoot = useCallback((): void => {
    if (isDefined(selectedSubProject) && selectedSubProject.id !== nextSelectedSubProjectAfterDelete?.id) {
      if (isDefined(nextSelectedSubProjectAfterDelete)) {
        navigateToSubProject(nextSelectedSubProjectAfterDelete.id)
      } else {
        navigateToProject()
      }
    }
    deleteSubProject(subProject.id)
    onDelete(component.id)
  }, [
    deleteSubProject,
    navigateToProject,
    navigateToSubProject,
    nextSelectedSubProjectAfterDelete,
    onDelete,
    component.id,
    selectedSubProject,
    subProject.id,
  ])

  const handleActionsClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
  }, [])

  const handleAddChild = useCallback(
    (type: ComponentSchema['type']): void => {
      addComponent(component.id, type)
      onAddChild({ targetId: component.id, targetType: 'component' }, type)
    },
    [addComponent, component.id, onAddChild],
  )

  const handleDelete = useCallback((): void => {
    switch (component.type) {
      case 'root-panel': {
        deleteRoot()
        break
      }
      case 'panel':
      case 'pocket-cluster': {
        deleteComponent(component.id)
        onDelete(component.id)
        break
      }
    }
  }, [onDelete, component.id, component.type, deleteComponent, deleteRoot])

  const handleClone = useCallback((): void => {
    switch (component.type) {
      case 'root-panel': {
        cloneSubProject(subProject)
        break
      }
      case 'panel':
      case 'pocket-cluster': {
        cloneComponent(component.id)
        break
      }
    }
  }, [cloneComponent, cloneSubProject, component.id, component.type, subProject])

  const handleAddStitchLine = useCallback(
    (type: StitchLineSchema['type']): void => {
      addStitchLineToComponent(component.id, type)
      onAddStitchLine({ targetId: component.id, targetType: 'component' }, type)
    },
    [addStitchLineToComponent, component.id, onAddStitchLine],
  )

  const handleAddHole = useCallback((): void => {
    addHole(component.id)
    onAddHole({ targetId: component.id, targetType: 'component' })
  }, [addHole, component.id, onAddHole])

  const HoleIcon = getModelIcon('hole')

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
              {!subProjectOnly && (
                <>
                  <AddChildComponentMenuSection component={component} onAddChild={handleAddChild} />
                  <Menu.Item value="hole" onSelect={handleAddHole}>
                    <HoleIcon />
                    <Menu.ItemText>{t.project.editors.actions.components.addHole}</Menu.ItemText>
                  </Menu.Item>
                  <Menu.Separator />
                  <AddComponentStitchLineMenu component={component} onAddStitchLine={handleAddStitchLine} />
                </>
              )}
              <Menu.Item value="clone" onSelect={handleClone}>
                <PiCopy />
                <Menu.ItemText>{t.project.editors.actions.components.clone}</Menu.ItemText>
              </Menu.Item>
              <Menu.Item
                onSelect={handleDelete}
                value="delete"
                color="fg.error"
                _hover={{ bg: 'bg.error', color: 'fg.error' }}
              >
                <PiTrash />
                <Menu.ItemText>{t.project.editors.actions.components.delete}</Menu.ItemText>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  )
}

type AddChildComponentMenuProps = {
  onAddChild: (type: ComponentSchema['type']) => void
  component: ComponentSchema
}

const possibleChildTypes: ComponentSchema['type'][] = ['panel', 'pocket-cluster']

const AddChildComponentMenuSection: FC<AddChildComponentMenuProps> = ({ onAddChild }) => {
  const { t } = useTranslation()

  const labels = useMemo<Record<ComponentSchema['type'], string>>(
    () => ({
      panel: t.project.editors.actions.components.addPanel,
      'root-panel': t.project.editors.actions.components.addRootPanel,
      'pocket-cluster': t.project.editors.actions.components.addPocketCluster,
    }),
    [t],
  )

  return (
    <>
      {possibleChildTypes.map((type) => {
        const Icon = getModelIcon(type)
        return (
          <Menu.Item key={type} value={type} onSelect={() => onAddChild(type)}>
            <Icon />
            <Menu.ItemText>{labels[type]}</Menu.ItemText>
          </Menu.Item>
        )
      })}
      {possibleChildTypes.length > 0 ? <Menu.Separator /> : null}
    </>
  )
}

type AddComponentStitchLineMenuProps = {
  onAddStitchLine: (type: StitchLineSchema['type']) => void
  component: ComponentSchema
}

export const AddComponentStitchLineMenu: FC<AddComponentStitchLineMenuProps> = ({ component, onAddStitchLine }) => {
  const { t } = useTranslation()

  const possibleTypes = useMemo<StitchLineSchema['type'][]>(() => {
    switch (component.type) {
      case 'root-panel':
      case 'panel':
        return ['component-bounds-stitch-line']
      case 'pocket-cluster':
        return ['component-bounds-stitch-line', 'pocket-cluster-stitch-line']
      default:
        return []
    }
  }, [component.type])

  const labels = useMemo<Record<StitchLineSchema['type'], string>>(
    () => ({
      'component-bounds-stitch-line': t.project.editors.actions.components.addStitching,
      'pocket-cluster-stitch-line': t.project.editors.actions.components.addPocketStitching,
    }),
    [t],
  )

  return (
    <>
      {possibleTypes.map((type) => {
        const Icon = getModelIcon(type)
        return (
          <Menu.Item key={type} value={type} onSelect={() => onAddStitchLine(type)}>
            <Icon />
            <Menu.ItemText>{labels[type]}</Menu.ItemText>
          </Menu.Item>
        )
      })}
      {possibleTypes.length > 0 ? <Menu.Separator /> : null}
    </>
  )
}
