import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  IconButton,
  Splitter,
  SplitterPanelData,
  SplitterResizeEndDetails,
  Text,
} from '@chakra-ui/react'
import { FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PiPlus, PiStack, PiWarningCircle } from 'react-icons/pi'
import { useDrawAreaContext } from '../contexts/DrawAreaContext'
import { useEditorContext } from '../contexts/EditorContext'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useMeasurement } from '../hooks/useMeasurement'
import { useProject } from '../hooks/useProject'
import { useProjectOperations } from '../hooks/useProjectOperations'
import { useTranslation } from '../hooks/useTranslation'
import type { HasTargetSchema } from '../schemas/common'
import type { ProjectSchema } from '../schemas/project'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { CommonEmptyState } from './common/CommonEmptyState'
import { ResizableAccordion, type ResizableAccordionState } from './common/resizable-accordion/ResizableAccordion'
import { ResizableAccordionItem } from './common/resizable-accordion/ResizableAccordionItem'
import { EditorComponentTree, type EditorComponentTreeHandle } from './component-tree/EditorComponentTree'
import { DrawArea } from './DrawArea'
import { EditorMenu } from './editor-menu/EditorMenu'
import { EditorSubProjectTabs } from './EditorSubProjectTabs'
import { FloatingEditors } from './FloatingEditors'
import { GlobalSettingsButton } from './GlobalSettingsButton'
import { CollapseAllIcon } from './icons/CollapseAllIcon'
import { ExpandAllIcon } from './icons/ExpandAllIcon'
import { SubProjectComputationFeedback } from './SubProjectComputationFeedback'

const panels: SplitterPanelData[] = [
  { id: 'draw-area', collapsible: false },
  { id: 'tree', resizeBehavior: 'preserve-pixel-size', maxSize: 50 },
]
type EditorContentProps = {
  menu: ReactElement
  projects: readonly ProjectSchema[]
  subProjectId: string | undefined
}

export const EditorContent: FC<EditorContentProps> = ({ menu, projects, subProjectId }) => {
  const { t } = useTranslation()
  const [accordionState, setAccordionState] = useState<ResizableAccordionState>({
    components: { open: true, size: 1 },
    openings: { open: true, size: 1 },
  })
  const { project } = useProject()
  const { setUISettings, settings } = useGlobalSettings()
  const { selected } = useDrawAreaContext().selection
  const { stopMeasuring } = useMeasurement()

  useEffect(() => {
    if (isDefined(selected)) {
      stopMeasuring()
    }
  }, [selected, stopMeasuring])

  const componentTreeRef = useRef<EditorComponentTreeHandle>(null)
  const subProject = useMemo<SubProjectSchema | undefined>(
    () => (isDefined(subProjectId) ? accessors.project(project).optional.subProject(subProjectId) : undefined),
    [project, subProjectId],
  )
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

  return (
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
            {isDefined(subProject) && <DrawArea />}
            {!isDefined(subProject) && isDefined(subProjectId) && <MissingSubProjectState />}
            {!isDefined(subProject) && !isDefined(subProjectId) && <EmptyProjectState />}

            <Box left="3" position="absolute" right="3" top="3" zIndex="1">
              <Flex alignItems="start" gap="3" justifyContent="space-between" minWidth="0">
                <Box maxWidth="100%" minWidth="0" width="fit-content">
                  <EditorMenu menu={menu} projects={projects} />
                </Box>
                <GlobalSettingsButton />
              </Flex>
            </Box>

            {isDefined(subProject) && <FloatingEditors onAdd={handleAdd} />}
            <SubProjectComputationFeedback />
          </Box>
        </Splitter.Panel>

        <Splitter.ResizeTrigger id="draw-area:tree" mt="3" mb="3">
          <Splitter.ResizeTriggerIndicator />
        </Splitter.ResizeTrigger>

        <Splitter.Panel id="tree" minHeight="0" minWidth="0">
          <Box height="100%" minHeight="0" minWidth="0" pb="3" pr="3" pt="3">
            <Card.Root bg="bg.panel" height="100%" minHeight="0" minWidth="0" overflow="hidden">
              <ResizableAccordion value={accordionState} onValueChange={setAccordionState}>
                <ResizableAccordionItem
                  id="components"
                  title={t.project.tree.title}
                  actions={
                    <HStack gap="1">
                      <IconButton disabled={!isDefined(subProject)} onClick={handleExpandAll} size="xs" variant="ghost">
                        <ExpandAllIcon />
                      </IconButton>
                      <IconButton
                        disabled={!isDefined(subProject)}
                        onClick={handleCollapseAll}
                        size="xs"
                        variant="ghost"
                      >
                        <CollapseAllIcon />
                      </IconButton>
                    </HStack>
                  }
                >
                  {isDefined(subProject) ? <EditorComponentTree ref={componentTreeRef} /> : <EmptyComponentTreeState />}
                </ResizableAccordionItem>
                <ResizableAccordionItem id="openings" title={t.project.editors.tabs.components.pocketOpenings}>
                  <Flex
                    alignItems="center"
                    color="fg.muted"
                    direction="column"
                    gap="2"
                    height="100%"
                    justifyContent="center"
                    minHeight="24"
                    p="4"
                  >
                    <PiStack size={24} />
                    <Text fontSize="sm">{t.project.editors.tabs.components.pocketOpenings}</Text>
                  </Flex>
                </ResizableAccordionItem>
              </ResizableAccordion>
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
