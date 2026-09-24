import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  IconButton,
  Splitter,
  SplitterPanelData,
  SplitterResizeEndDetails,
} from '@chakra-ui/react'
import { FC, ReactElement, useCallback, useMemo, useRef } from 'react'
import { PiCopySimple, PiMinus, PiPlus, PiWarningCircle } from 'react-icons/pi'
import { useEditorContext } from '../contexts/EditorContext'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useProject } from '../hooks/useProject'
import { useProjectOperations } from '../hooks/useProjectOperations'
import { useTranslation } from '../hooks/useTranslation'
import type { ProjectSchema } from '../schemas/project'
import { isDefined } from '../utils/isDefined'
import { CommonEmptyState } from './common/CommonEmptyState'
import { EditorComponentTree, type EditorComponentTreeHandle } from './component-tree/EditorComponentTree'
import { DrawArea } from './DrawArea'
import { EditorMenu } from './editor-menu/EditorMenu'
import { EditorSubProjectTabs } from './EditorSubProjectTabs'
import { FloatingEditors } from './FloatingEditors'

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
  const { project } = useProject()
  const { setAppSettings, settings } = useGlobalSettings()
  const componentTreeRef = useRef<EditorComponentTreeHandle>(null)
  const subProject = useMemo(
    () => project.subProjects.find((candidate) => candidate.id === subProjectId),
    [project.subProjects, subProjectId],
  )
  const handleResizeEnd = useCallback(
    ({ size }: SplitterResizeEndDetails): void => {
      setAppSettings({ splitterSizes: [size[0], size[1]] })
    },
    [setAppSettings],
  )
  const handleCollapseAll = useCallback((): void => {
    componentTreeRef.current?.collapseAll()
  }, [])

  const handleExpandAll = useCallback((): void => {
    componentTreeRef.current?.expandAll()
  }, [])

  return (
    <Flex direction="column" height="100%" minHeight="0" minWidth="0">
      <Splitter.Root
        defaultSize={settings.app.splitterSizes}
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
              <Box maxWidth="100%" width="fit-content">
                <EditorMenu menu={menu} projects={projects} />
              </Box>
            </Box>

            {isDefined(subProject) && <FloatingEditors />}
          </Box>
        </Splitter.Panel>

        <Splitter.ResizeTrigger id="draw-area:tree" mt="3" mb="3">
          <Splitter.ResizeTriggerIndicator />
        </Splitter.ResizeTrigger>

        <Splitter.Panel id="tree" minHeight="0" minWidth="0">
          <Box height="100%" minHeight="0" minWidth="0" pb="3" pr="3" pt="3">
            <Card.Root bg="bg.panel" height="100%" minHeight="0" minWidth="0">
              <Card.Header pt="4">
                <Flex alignItems="center" justifyContent="space-between">
                  <Heading size="sm">{t.project.tree.title}</Heading>
                  <HStack gap="1">
                    <IconButton disabled={!isDefined(subProject)} onClick={handleExpandAll} size="xs" variant="ghost">
                      <PiCopySimple />
                      <PiPlus
                        style={{
                          left: '50%',
                          position: 'absolute',
                          top: '50%',
                          transform: 'translate(-56.25%, -43.75%) scale(0.5)',
                        }}
                      />
                    </IconButton>
                    <IconButton disabled={!isDefined(subProject)} onClick={handleCollapseAll} size="xs" variant="ghost">
                      <PiCopySimple />
                      <PiMinus
                        style={{
                          left: '50%',
                          position: 'absolute',
                          top: '50%',
                          transform: 'translate(-56.25%, -43.75%) scale(0.5)',
                        }}
                      />
                    </IconButton>
                  </HStack>
                </Flex>
              </Card.Header>
              <Card.Body flex="1" minHeight="0" overflow="auto" padding="4">
                {isDefined(subProject) ? <EditorComponentTree ref={componentTreeRef} /> : <EmptyComponentTreeState />}
              </Card.Body>
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
  const { navigateToSubProject } = useEditorContext()

  const handleCreateSubProject = useCallback((): void => {
    const subProject = createSubProject()
    navigateToSubProject(subProject.id)
  }, [createSubProject, navigateToSubProject])

  return (
    <CommonEmptyState
      content={
        <Button onClick={handleCreateSubProject} variant="solid">
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
