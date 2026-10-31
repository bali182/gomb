import { Box, Button, Code, Spinner, Stack } from '@chakra-ui/react'
import { useEffect, useEffectEvent, useMemo, type FC } from 'react'
import { PiWarningCircle } from 'react-icons/pi'
import { useNavigate, useParams } from 'react-router'
import { accessors } from '../../../common/utils/accessors'

import { CommonEmptyState } from '../../../common/components/common/CommonEmptyState'
import { useEditorContext } from '../../../common/contexts/EditorContext'
import { useProject } from '../../../common/hooks/useProject'
import { useTranslation } from '../../../common/hooks/useTranslation'
import { Loadable } from '../../../common/loadable'
import type { ProjectSchema } from '../../../common/schemas/project'
import { isDefined } from '../../../common/utils/isDefined'
import { ElectronEditorContextProvider } from '../../contexts/ElectronEditorContextProvider'
import { electronAppRoutes } from '../../electronAppRoutes'
import { useElectronProject } from '../../hooks/useElectronProject'
import type { ElectronProjectSchema } from '../../schemas/electronProject'
import type { ElectronSubProjectRouteParamsSchema } from '../../schemas/electronRouteParams'
import { ElectronEditor } from '../ElectronEditor'

export const ElectronProjectRoute: FC = () => {
  const { filePath } = useParams<ElectronSubProjectRouteParamsSchema>()
  const { electronProject, loadProject } = useElectronProject(filePath)
  const isCurrentFilePath = useMemo<boolean>(
    () =>
      Loadable.get(
        Loadable.map(
          electronProject,
          (loadedElectronProject: ElectronProjectSchema): boolean => loadedElectronProject.filePath === filePath,
        ),
        false,
      ),
    [electronProject, filePath],
  )
  const loadProjectInEffect = useEffectEvent((): Promise<void> => {
    return loadProject()
  })

  useEffect(() => {
    loadProjectInEffect()
  }, [filePath])

  if (electronProject.type === 'failed') {
    return <ElectronProjectLoadFailed filePath={filePath ?? ''} />
  }

  if (!Loadable.hasValue(electronProject) || isCurrentFilePath === false) {
    return <ElectronProjectLoading />
  }

  return (
    <ElectronEditorContextProvider>
      <ElectronProjectRouteContent />
    </ElectronEditorContextProvider>
  )
}

const ElectronProjectRouteContent: FC = () => {
  const { filePath, subProjectId } = useParams<ElectronSubProjectRouteParamsSchema>()
  const { project } = useProject()
  const { computedSubProject } = useEditorContext()
  const navigate = useNavigate()
  const targetPath = useMemo<string | undefined>(
    () => (computedSubProject.type === 'uninitialized' ? getTargetPath(project, filePath, subProjectId) : undefined),
    [computedSubProject.type, filePath, project, subProjectId],
  )

  useEffect(() => {
    if (!isDefined(targetPath)) {
      return
    }

    navigate(targetPath, { replace: true })
  }, [navigate, targetPath])

  return isDefined(targetPath) ? <ElectronProjectLoading /> : <ElectronEditor />
}

const ElectronProjectLoading: FC = () => {
  return (
    <Box alignItems="center" display="flex" height="100%" justifyContent="center">
      <Spinner />
    </Box>
  )
}

type ElectronProjectLoadFailedProps = {
  filePath: string
}

const ElectronProjectLoadFailed: FC<ElectronProjectLoadFailedProps> = ({ filePath }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleBack = (): void => {
    navigate(electronAppRoutes.projects)
  }

  return (
    <CommonEmptyState
      content={
        <Button onClick={handleBack} variant="solid">
          {t.projects.errors.openFailed.back}
        </Button>
      }
      description={
        <Stack align="center" gap="2">
          <Box>{t.projects.errors.openFailed.description}</Box>
          <Code>{filePath}</Code>
        </Stack>
      }
      icon={<PiWarningCircle />}
      title={t.projects.errors.openFailed.title}
    />
  )
}

const getTargetPath = (
  project: ProjectSchema,
  filePath: string | undefined,
  subProjectId: string | undefined,
): string | undefined => {
  if (!isDefined(filePath)) {
    return undefined
  }

  const selectedSubProject = isDefined(subProjectId)
    ? accessors.project(project).optional.subProject(subProjectId)
    : undefined

  if (isDefined(selectedSubProject)) {
    return undefined
  }

  const firstSubProject = project.subProjects[0]
  if (isDefined(firstSubProject)) {
    return electronAppRoutes.subProject(filePath, firstSubProject.id)
  }

  return isDefined(subProjectId) ? electronAppRoutes.project(filePath) : undefined
}
