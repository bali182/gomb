import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loadable } from '../loadable'
import { applyExportContentSettings } from '../logic/exports/applyExportContentSettings'
import { exportProject } from '../logic/exports/exportProject'
import { getExportElements } from '../logic/exports/getExportElements'
import { getExportLayout } from '../logic/exports/getExportLayout'
import { getExportPageSize } from '../logic/exports/getExportPageSize'
import type { DrawAreaContextValue } from '../schemas/drawArea'
import type { ExportElementSchema, ExportLayoutSchema, ExportPageElementSchema } from '../schemas/export'
import type { SizeSchema } from '../schemas/geometry'
import type { LoadableSchema } from '../schemas/loadable'
import type { ComputedProjectSchema, ProjectSchema } from '../schemas/project'
import type { ExportSettingsSchema } from '../schemas/settings'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'
import { createEditorComputationWorker } from '../workers/createEditorComputationWorker'
import { useExportDrawArea } from './useExportDrawArea'
import { useTranslation } from './useTranslation'

type ExportPreparation = {
  project: ProjectSchema
  computedProject: ComputedProjectSchema
  elements: ExportElementSchema[]
}

type UseExportProjectParams = {
  project: ProjectSchema
  settings: ExportSettingsSchema
  disabled: boolean
  isValid: boolean
}

type UseExportProjectResult = {
  layout: LoadableSchema<ExportLayoutSchema>
  exportStatus: LoadableSchema<void>
  export: () => Promise<void>
  reset: () => void
  retryPreparation: () => void
  controlsDisabled: boolean
  exportDisabled: boolean
  errorMessage: string | undefined
  pageSize: SizeSchema
  drawAreaContext: DrawAreaContextValue
}

export const useExportProject = ({
  project,
  settings,
  disabled,
  isValid,
}: UseExportProjectParams): UseExportProjectResult => {
  const { t } = useTranslation()
  const drawAreaContext = useExportDrawArea(project.stitchingSettings, settings)
  const [preparation, setPreparation] = useState<LoadableSchema<ExportPreparation>>(Loadable.uninitialized)
  const [exportStatus, setExportStatus] = useState<LoadableSchema<void>>(Loadable.uninitialized)
  const [attempt, setAttempt] = useState<number>(0)
  const exportAttempt = useRef<number>(0)

  const reset = useCallback((): void => {
    exportAttempt.current += 1
    setExportStatus(Loadable.uninitialized())
  }, [])

  const retryPreparation = useCallback((): void => {
    reset()
    setAttempt((current: number): number => current + 1)
  }, [reset])

  useEffect(() => {
    if (disabled) {
      return
    }
    const worker = createEditorComputationWorker()
    let active = true
    reset()
    setPreparation(Loadable.loading())
    const prepare = async (): Promise<void> => {
      try {
        const subProjects: SubProjectSchema[] = []
        const computedSubProjects: ComputedSubProjectSchema[] = []
        for (const [index, subProject] of project.subProjects.entries()) {
          const result = await worker.compute(
            {
              requestId: index + 1,
              subProject,
              stitchingSettings: project.stitchingSettings,
            },
            (): boolean => active,
          )
          if (!active || !isDefined(result)) {
            return
          }
          subProjects.push(result.subProject)
          computedSubProjects.push(result.computedSubProject)
        }
        const preparedProject: ProjectSchema = { ...project, subProjects }
        const computedProject: ComputedProjectSchema = {
          id: project.id,
          name: project.name,
          subProjects: computedSubProjects,
        }
        const elements = getExportElements(preparedProject, computedProject)
        setPreparation(Loadable.loaded({ project: preparedProject, computedProject, elements }))
      } catch (error) {
        if (active) {
          console.error('Unable to prepare export:', error)
          setPreparation(Loadable.failed(error))
        }
      } finally {
        worker.terminate()
      }
    }

    prepare()

    return () => {
      active = false
      worker.terminate()
      setPreparation(Loadable.uninitialized())
      reset()
    }
  }, [project, disabled, attempt, reset])

  const layout = useMemo<LoadableSchema<ExportLayoutSchema>>(() => {
    if (disabled) {
      return Loadable.uninitialized()
    }
    return Loadable.map(preparation, ({ elements }) => {
      const configuredElements = applyExportContentSettings(elements, settings)
      return getExportLayout(configuredElements, settings, drawAreaContext)
    })
  }, [preparation, settings, drawAreaContext, disabled])

  const oversizedElements = useMemo<ExportPageElementSchema[]>(() => {
    if (layout.type !== 'loaded') {
      return []
    }
    return layout.data.pages.flatMap((page) => page.elements.filter((element) => element.isOversized))
  }, [layout])

  const errorMessage = useMemo<string | undefined>(() => {
    if (oversizedElements.length > 0) {
      const names = oversizedElements.map(({ element }) => element.component.name).join(', ')
      return `${t.dialogs.export.errors.oversizedComponents} ${names}`
    }
    if (exportStatus.type === 'failed') {
      return t.dialogs.export.errors.exportFailed
    }
    return undefined
  }, [oversizedElements, exportStatus, t.dialogs.export.errors])

  const pageSize = useMemo<SizeSchema>(
    () => getExportPageSize(settings.page, settings.orientation),
    [settings.page, settings.orientation],
  )
  const controlsDisabled = disabled || layout.type !== 'loaded' || exportStatus.type === 'loading'
  const exportDisabled = controlsDisabled || !isValid || oversizedElements.length > 0

  const handleExport = useCallback(async (): Promise<void> => {
    if (exportDisabled || preparation.type !== 'loaded' || layout.type !== 'loaded') {
      return
    }
    const attemptId = ++exportAttempt.current
    setExportStatus(Loadable.loading())
    try {
      await exportProject({
        layout: layout.data,
        pageSize,
        projectName: preparation.data.project.name,
        format: settings.format,
        context: drawAreaContext,
        translation: t,
      })
      if (attemptId === exportAttempt.current) {
        setExportStatus(Loadable.loaded<void>(undefined))
      }
    } catch (error) {
      if (attemptId === exportAttempt.current) {
        console.error('Unable to export project:', error)
        setExportStatus(Loadable.failed(error))
      }
    }
  }, [exportDisabled, preparation, layout, pageSize, settings.format, drawAreaContext, t])

  return {
    layout,
    exportStatus,
    export: handleExport,
    reset,
    retryPreparation,
    controlsDisabled,
    exportDisabled,
    errorMessage,
    pageSize,
    drawAreaContext,
  }
}
