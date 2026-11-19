import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Splitter,
  SplitterPanelData,
  SplitterResizeEndDetails,
} from '@chakra-ui/react'
import { FC, ReactElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PiPlus, PiPlusCircle, PiWarningCircle } from 'react-icons/pi'
import { useDrawAreaContext } from '../contexts/DrawAreaContext'
import { useEditorContext } from '../contexts/EditorContext'
import { useDrawAreaTurn } from '../hooks/useDrawAreaTurn'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useMeasurement } from '../hooks/useMeasurement'
import { useProject } from '../hooks/useProject'
import { useProjectOperations } from '../hooks/useProjectOperations'
import { useSubProjectOperations } from '../hooks/useSubProjectOperations'
import { useTranslation } from '../hooks/useTranslation'
import type { HasTargetSchema } from '../schemas/common'
import type { RootPanelFaceSideSchema } from '../schemas/components'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { ProjectSchema } from '../schemas/project'
import type { TreeSectionsSettingsSchema } from '../schemas/settings'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { AddPocketOpeningMenu } from './action-menus/AddPocketOpeningMenu'
import { EditorBindingTree } from './binding-tree/EditorBindingTree'
import { CommonEmptyState } from './common/CommonEmptyState'
import {
  ResizableAccordion,
  type ResizableAccordionChangeEvent,
  type ResizableAccordionHandle,
} from './common/resizable-accordion/ResizableAccordion'
import {
  ResizableAccordionHeaderButton,
  ResizableAccordionHeaderIconButton,
} from './common/resizable-accordion/ResizableAccordionHeaderButtons'
import { ResizableAccordionItem } from './common/resizable-accordion/ResizableAccordionItem'
import { EditorComponentTree, type EditorComponentTreeHandle } from './component-tree/EditorComponentTree'
import { EditorTreeDragAndDrop } from './component-tree/EditorTreeDragAndDrop'
import { DrawArea } from './DrawArea'
import { EditorMenu } from './editor-menu/EditorMenu'
import { EditorDialogsProvider } from './EditorDialogsProvider'
import { EditorSubProjectTabs } from './EditorSubProjectTabs'
import { FloatingEditors } from './FloatingEditors'
import { GlobalSettingsButton } from './GlobalSettingsButton'
import { CollapseAllIcon } from './icons/CollapseAllIcon'
import { ExpandAllIcon } from './icons/ExpandAllIcon'
import { EditorPocketOpeningTree } from './pocket-opening-tree/EditorPocketOpeningTree'
import { SubProjectComputationFeedback } from './SubProjectComputationFeedback'

const panels: SplitterPanelData[] = [
  { id: 'draw-area', collapsible: false },
  { id: 'tree', resizeBehavior: 'preserve-pixel-size', maxSize: 50 },
]

type ItemCounts = {
  components: number | undefined
  pocketOpenings: number | undefined
  bindings: number | undefined
}

type EditorContentProps = {
  menu: ReactElement
  projects: readonly ProjectSchema[]
  subProjectId: string | undefined
}

export const EditorContent: FC<EditorContentProps> = ({ menu, projects, subProjectId }) => {
  const { t } = useTranslation()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { addBinding, addPocketOpening } = useSubProjectOperations()
  const { project } = useProject()
  const { setUISettings, settings } = useGlobalSettings()
  const [treeSections, setTreeSections] = useState<TreeSectionsSettingsSchema>(() => settings.ui.treeSections)
  const accordionRef = useRef<ResizableAccordionHandle>(null)
  const { selection, rootPanelFaceId, flipRootPanelFace } = useDrawAreaContext()
  const { selected, clearSelection } = selection
  const { stopMeasuring } = useMeasurement()
  const { presentation, floatingEditorsVisible } = useDrawAreaTurn()

  const handleTreeSectionsChange = useCallback(
    (event: ResizableAccordionChangeEvent): void => {
      const next: TreeSectionsSettingsSchema = {
        components: event.value.components,
        openings: event.value.openings,
        bindings: event.value.bindings,
      }
      setTreeSections(next)
      switch (event.type) {
        case 'resize-start':
        case 'resize':
          return
        case 'resize-end':
        case 'resize-cancel':
        case 'toggle':
        case 'programmatic':
          setUISettings({ treeSections: next })
      }
    },
    [setUISettings],
  )

  useEffect(() => {
    if (isDefined(selected)) {
      stopMeasuring()
    }
  }, [selected, stopMeasuring])

  useLayoutEffect(() => {
    if (!isDefined(selected)) {
      return
    }
    if (narrowers.is.pocketOpening(selected)) {
      accordionRef.current?.setItemState('openings', { open: true })
    } else if (narrowers.is.binding(selected)) {
      accordionRef.current?.setItemState('bindings', { open: true })
    }
  }, [selected])

  const componentTreeRef = useRef<EditorComponentTreeHandle>(null)
  const subProject = useMemo<SubProjectSchema | undefined>(
    () => (isDefined(subProjectId) ? accessors.project(project).optional.subProject(subProjectId) : undefined),
    [project, subProjectId],
  )
  const accessor = useMemo(() => (isDefined(subProject) ? accessors.subProject(subProject) : undefined), [subProject])

  const activeSide: RootPanelFaceSideSchema | undefined = useMemo(() => {
    if (!isDefined(accessor)) {
      return undefined
    }
    return rootPanelFaceId === accessor.component.rootPanel().backFaceId ? 'back' : 'front'
  }, [accessor, rootPanelFaceId])

  const handleResizeEnd = useCallback(
    ({ size }: SplitterResizeEndDetails): void => {
      setUISettings({ splitterSizes: [size[0], size[1]] })
    },
    [setUISettings],
  )
  const handleCollapseAll = useCallback((): void => {
    componentTreeRef.current?.collapseAll()
  }, [])

  const handleExpandAll = useCallback((): void => {
    componentTreeRef.current?.expandAll()
  }, [])

  const handleAdd = useCallback((target: HasTargetSchema): void => {
    componentTreeRef.current?.expand(target)
  }, [])

  const handleAddBinding = useCallback((): void => {
    setEditingInputId(undefined)
    addBinding({ type: 'equal-binding' })
    accordionRef.current?.setItemState('bindings', { open: true })
  }, [addBinding, setEditingInputId])

  const handleAddPocketOpening = useCallback(
    (type: PocketOpeningSchema['type']): void => {
      setEditingInputId(undefined)
      addPocketOpening({ type })
      accordionRef.current?.setItemState('openings', { open: true })
    },
    [addPocketOpening, setEditingInputId],
  )

  const itemCounts = useMemo<ItemCounts | undefined>(() => {
    if (!isDefined(accessor)) {
      return undefined
    }
    return {
      components: accessor.component.components().length,
      bindings: accessor.binding.bindings().length,
      pocketOpenings: accessor.pocketOpening.pocketOpenings().length,
    }
  }, [accessor])

  return (
    <EditorDialogsProvider>
      <Flex direction="column" height="100%" minHeight="0" minWidth="0">
        <Splitter.Root
          defaultSize={settings.ui.splitterSizes}
          flex="1"
          minHeight="0"
          minWidth="0"
          orientation="horizontal"
          onResizeEnd={handleResizeEnd}
          panels={panels}
        >
          <Splitter.Panel id="draw-area" minHeight="0" minWidth="0">
            <Box height="100%" minHeight="0" minWidth="0" overflow="hidden" position="relative">
              {isDefined(presentation) && <DrawArea presentation={presentation} />}
              {!isDefined(subProject) && isDefined(subProjectId) && <MissingSubProjectState />}
              {!isDefined(subProject) && !isDefined(subProjectId) && <EmptyProjectState />}

              <Box left="3" position="absolute" right="3" top="3" zIndex="1" onClickCapture={clearSelection}>
                <Flex alignItems="start" gap="3" justifyContent="space-between" minWidth="0">
                  <Box maxWidth="100%" minWidth="0" width="fit-content">
                    <EditorMenu menu={menu} projects={projects} />
                  </Box>
                  <GlobalSettingsButton />
                </Flex>
              </Box>

              {floatingEditorsVisible && <FloatingEditors onAdd={handleAdd} />}
              <SubProjectComputationFeedback />
            </Box>
          </Splitter.Panel>

          <Splitter.ResizeTrigger id="draw-area:tree" mt="3" mb="3">
            <Splitter.ResizeTriggerIndicator />
          </Splitter.ResizeTrigger>

          <Splitter.Panel id="tree" minHeight="0" minWidth="0" onClickCapture={clearSelection}>
            <Box height="100%" minHeight="0" minWidth="0" pb="3" pr="3" pt="3">
              <Card.Root bg="bg.panel" height="100%" minHeight="0" minWidth="0" overflow="hidden">
                <EditorTreeDragAndDrop>
                  <ResizableAccordion ref={accordionRef} value={treeSections} onValueChange={handleTreeSectionsChange}>
                    <ResizableAccordionItem
                      id="components"
                      title={
                        <HStack gap="2">
                          {t.project.tree.sections.components}
                          {isDefined(activeSide) && (
                            <Badge>{t.project.editors.enums.components.rootPanelFaceSide[activeSide]}</Badge>
                          )}
                          {isDefined(itemCounts) && (
                            <Badge bg="bg" variant="surface">
                              {itemCounts.components}
                            </Badge>
                          )}
                        </HStack>
                      }
                      actions={
                        <HStack gap="1">
                          <ResizableAccordionHeaderButton
                            disabled={!isDefined(subProject) || isComputing}
                            onClick={flipRootPanelFace}
                          >
                            {t.project.rootPanelFaces.flip}
                          </ResizableAccordionHeaderButton>
                          <ResizableAccordionHeaderIconButton
                            disabled={!isDefined(subProject)}
                            onClick={handleExpandAll}
                          >
                            <ExpandAllIcon />
                          </ResizableAccordionHeaderIconButton>
                          <ResizableAccordionHeaderIconButton
                            disabled={!isDefined(subProject)}
                            onClick={handleCollapseAll}
                          >
                            <CollapseAllIcon />
                          </ResizableAccordionHeaderIconButton>
                        </HStack>
                      }
                    >
                      {isDefined(subProject) ? (
                        <EditorComponentTree ref={componentTreeRef} />
                      ) : (
                        <EmptyComponentTreeState />
                      )}
                    </ResizableAccordionItem>
                    <ResizableAccordionItem
                      id="openings"
                      title={
                        <HStack gap="2">
                          {t.project.tree.sections.pocketOpenings}
                          {isDefined(itemCounts) && (
                            <Badge bg="bg" variant="surface">
                              {itemCounts.pocketOpenings}
                            </Badge>
                          )}
                        </HStack>
                      }
                      actions={<AddPocketOpeningMenu onAdd={handleAddPocketOpening} />}
                    >
                      {isDefined(subProject) ? <EditorPocketOpeningTree /> : <EmptyComponentTreeState />}
                    </ResizableAccordionItem>
                    <ResizableAccordionItem
                      id="bindings"
                      title={
                        <HStack gap="2">
                          {t.project.tree.sections.bindings}
                          {isDefined(itemCounts) && (
                            <Badge bg="bg" variant="surface">
                              {itemCounts.bindings}
                            </Badge>
                          )}
                        </HStack>
                      }
                      actions={
                        <ResizableAccordionHeaderButton
                          disabled={!isDefined(subProject) || isComputing}
                          onClick={handleAddBinding}
                        >
                          <PiPlusCircle />
                          {t.project.editors.actions.bindings.add}
                        </ResizableAccordionHeaderButton>
                      }
                    >
                      {isDefined(subProject) ? <EditorBindingTree /> : <EmptyComponentTreeState />}
                    </ResizableAccordionItem>
                  </ResizableAccordion>
                </EditorTreeDragAndDrop>
              </Card.Root>
            </Box>
          </Splitter.Panel>
        </Splitter.Root>

        <Box
          bg="bg.panel"
          borderColor="border"
          borderTopWidth="1px"
          flexShrink="0"
          overflowX="auto"
          overflowY="hidden"
          width="100%"
        >
          <Box minWidth="100%" width="max-content">
            <EditorSubProjectTabs />
          </Box>
        </Box>
      </Flex>
    </EditorDialogsProvider>
  )
}

const EmptyProjectState: FC = () => {
  const { t } = useTranslation()
  const { createSubProject } = useProjectOperations()
  const { navigateToSubProject, isComputing, setEditingInputId } = useEditorContext()

  const handleCreateSubProject = useCallback((): void => {
    setEditingInputId(undefined)
    const subProject = createSubProject()
    navigateToSubProject(subProject.id)
  }, [createSubProject, navigateToSubProject, setEditingInputId])

  return (
    <CommonEmptyState
      content={
        <Button disabled={isComputing} onClick={handleCreateSubProject} variant="solid">
          <PiPlus />
          {t.project.editors.actions.components.addRootPanel}
        </Button>
      }
      description={t.project.errors.noModules.description}
      icon={<PiWarningCircle />}
      title={t.project.errors.noModules.title}
    />
  )
}

const MissingSubProjectState: FC = () => {
  const { t } = useTranslation()

  return (
    <CommonEmptyState
      description={t.project.errors.moduleNotFound.description}
      icon={<PiWarningCircle />}
      title={t.project.errors.moduleNotFound.title}
    />
  )
}

const EmptyComponentTreeState: FC = () => {
  const { t } = useTranslation()

  return (
    <CommonEmptyState
      title={t.project.tree.noModuleSelected.title}
      description={t.project.tree.noModuleSelected.description}
      icon={<PiWarningCircle />}
    />
  )
}
