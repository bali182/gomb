import { Box, IconButton, IconButtonProps, Menu, Portal } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC, type MouseEvent } from 'react'
import { PiDotsThreeVertical } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useEditorDrawArea } from '../../hooks/useEditorDrawArea'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { useOptionalSubProject } from '../../hooks/useOptionalSubProject'
import { useProject } from '../../hooks/useProject'
import { useProjectOperations } from '../../hooks/useProjectOperations'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import { exportComponentPng } from '../../logic/exports/exportComponentPng'
import {
  canAddChild,
  canAddHole,
  canCloneComponent,
  canDeleteComponent,
  getComponentStitchLineType,
} from '../../operations/subProject/utils/componentRules'
import { portalRef } from '../../portalRef'
import type { HasComponentTargetSchema, HasTargetSchema } from '../../schemas/common'
import type { ComponentSchema } from '../../schemas/components'
import type { PocketSettingsCopyTargetsSchema } from '../../schemas/pocketCopy'
import type { StitchLineSchema } from '../../schemas/stitching'
import { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { noop } from '../../utils/noop'
import { PocketCopyDialog } from '../pocket-copy/PocketCopyDialog'
import { toaster } from '../Toaster'
import { ActionsMenuSection } from './ActionsMenuSection'
import {
  AddComponentMenuItem,
  AddComponentStitchLineMenuItem,
  AddHoleMenuItem,
  CloneComponentMenuItem,
  CopyPocketSettingsMenuItem,
  DeleteComponentMenuItem,
  ExportComponentPngMenuItem,
} from './ComponentActionsMenuItems'

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

const childTypes: ComponentSchema['type'][] = ['panel', 'pocket-cluster', 't-pocket', 'front-pocket']

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
  const { settings } = useGlobalSettings()
  const exportDrawAreaContext = useEditorDrawArea(false)
  const { subProject: selectedSubProject } = useOptionalSubProject()
  const { cloneSubProject, deleteSubProject } = useProjectOperations()
  const {
    addComponent,
    addPocketCluster,
    addHole,
    addStitchLineToComponent,
    cloneComponent,
    deleteComponent,
    copyPocketSettings,
  } = useSubProjectOperations()
  const [isPocketCopyOpen, setPocketCopyOpen] = useState<boolean>(false)
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
      if (type === 'pocket-cluster') {
        addPocketCluster(component.id, 'end')
      } else {
        addComponent(component.id, type, type === 't-pocket' ? 'start' : 'end')
      }
      onAddChild({ targetId: component.id, targetType: 'component' }, type)
    },
    [addComponent, addPocketCluster, component.id, onAddChild],
  )

  const handleDelete = useCallback((): void => {
    switch (component.type) {
      case 'root-panel': {
        deleteRoot()
        break
      }
      case 't-pocket':
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
      case 't-pocket':
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

  const handleExportPng = useCallback(async (): Promise<void> => {
    try {
      await exportComponentPng({
        project,
        subProject,
        componentId: component.id,
        settings,
        context: exportDrawAreaContext,
        translation: t,
      })
    } catch (error) {
      console.error('Unable to export component:', error)
      toaster.create({ type: 'error', title: t.dialogs.export.errors.exportFailed })
    }
  }, [project, subProject, component.id, settings, exportDrawAreaContext, t])

  const possibleChildTypes = childTypes.filter((type) => canAddChild(component, type, subProject))
  const stitchLineType = getComponentStitchLineType(component)

  const canClone = component.type === 'root-panel' || canCloneComponent(component)
  const canDelete = component.type === 'root-panel' || canDeleteComponent(component)
  const handleOpenPocketCopy = useCallback((): void => {
    setPocketCopyOpen(true)
  }, [])
  const handleCopyPocketSettings = useCallback(
    (targets: Partial<PocketSettingsCopyTargetsSchema>): void => {
      copyPocketSettings(component.id, targets)
      setPocketCopyOpen(false)
    },
    [component.id, copyPocketSettings],
  )
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
                {!subProjectOnly &&
                  possibleChildTypes.map((type) => (
                    <AddComponentMenuItem key={type} type={type} onSelect={handleAddChild} />
                  ))}
              </ActionsMenuSection>
              <ActionsMenuSection>
                {!subProjectOnly && canAddHole(component) && <AddHoleMenuItem onSelect={handleAddHole} />}
              </ActionsMenuSection>
              <ActionsMenuSection>
                {!subProjectOnly && isDefined(stitchLineType) && (
                  <AddComponentStitchLineMenuItem type={stitchLineType} onSelect={handleAddStitchLine} />
                )}
              </ActionsMenuSection>
              <ActionsMenuSection>
                {!subProjectOnly && narrowers.is.pocket(component) && (
                  <CopyPocketSettingsMenuItem onSelect={handleOpenPocketCopy} />
                )}
              </ActionsMenuSection>
              <ActionsMenuSection>
                {!subProjectOnly && <ExportComponentPngMenuItem onSelect={handleExportPng} />}
              </ActionsMenuSection>
              <ActionsMenuSection>
                {canClone && <CloneComponentMenuItem onSelect={handleClone} />}
                {canDelete && <DeleteComponentMenuItem onSelect={handleDelete} />}
              </ActionsMenuSection>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      {!subProjectOnly && narrowers.is.pocket(component) && (
        <PocketCopyDialog
          subProject={subProject}
          sourcePocketId={component.id}
          isOpen={isPocketCopyOpen}
          onOpenChange={setPocketCopyOpen}
          onSubmit={handleCopyPocketSettings}
        />
      )}
    </Box>
  )
}
