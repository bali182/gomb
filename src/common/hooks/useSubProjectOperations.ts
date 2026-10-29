import { useCallback, useMemo } from 'react'

import { toaster } from '../components/Toaster'
import { useEditorContext } from '../contexts/EditorContext'
import {
  addComponent as addComponentPure,
  type ComponentInsertionPositionSchema,
} from '../operations/subProject/addComponent'
import { addHole as addHolePure } from '../operations/subProject/addHole'
import { addStitchLine as addStitchLinePure } from '../operations/subProject/addStitchLine'
import { cloneComponent as cloneComponentPure } from '../operations/subProject/cloneComponent'
import { cloneHole as cloneHolePure } from '../operations/subProject/cloneHole'
import { cloneStitchLine as cloneStitchLinePure } from '../operations/subProject/cloneStitchLine'
import { deleteComponent as deleteComponentPure } from '../operations/subProject/deleteComponent'
import { deleteHole as deleteHolePure } from '../operations/subProject/deleteHole'
import { deleteStitchLine as deleteStitchLinePure } from '../operations/subProject/deleteStitchLine'
import { flip as flipPure } from '../operations/subProject/flip'
import { moveComponent as moveComponentPure } from '../operations/subProject/moveComponent'
import { moveHole as moveHolePure } from '../operations/subProject/moveHole'
import { moveStitchLine as moveStitchLinePure } from '../operations/subProject/moveStitchLine'
import { updateComponent as updateComponentPure } from '../operations/subProject/updateComponent'
import { updateHole as updateHolePure } from '../operations/subProject/updateHole'
import { updatePocketLocks as updatePocketLocksPure } from '../operations/subProject/updatePocketLocks'
import { updateStitchLine as updateStitchLinePure } from '../operations/subProject/updateStitchLine'
import { applySubProjectLocks } from '../operations/subProject/utils/applySubProjectLocks'
import { createComponent } from '../operations/subProject/utils/createComponent'
import { createHole } from '../operations/subProject/utils/createHole'
import { createStitchLine } from '../operations/subProject/utils/createStitchLine'
import { getUnusedComponentName } from '../operations/subProject/utils/getUnusedComponentName'
import { getUnusedHoleName } from '../operations/subProject/utils/getUnusedHoleName'
import { getUnusedName } from '../operations/subProject/utils/getUnusedName'
import type { FlipAxisSchema } from '../schemas/common'
import type { ComponentSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { PocketLocksDraftSchema } from '../schemas/lock'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { ProjectSchema } from '../schemas/project'
import type { ComponentBoundsStitchLineSchema, StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import type { SubProjectHistoryThrottleKeySchema } from '../schemas/subProjectHistory'
import type { SubProjectOperationResultSchema } from '../schemas/subProjectOperation'
import { accessors } from '../utils/accessors'
import { getUnusedStitchLineName } from '../utils/getUnusedStitchLineName'
import { id } from '../utils/id'
import { isDefined } from '../utils/isDefined'
import { useGlobalSettings } from './useGlobalSettings'
import { useSubProjectHistory } from './useSubProjectHistory'
import { useTranslation } from './useTranslation'

export type UseSubProjectOperationsOutput = {
  addComponent: (
    parentId: string,
    type: ComponentSchema['type'],
    position: ComponentInsertionPositionSchema,
  ) => ComponentSchema
  addHole: (componentId: string) => HoleSchema
  addStitchLineToComponent: (componentId: string, type: StitchLineSchema['type']) => StitchLineSchema
  addStitchLineToHole: (holeId: string) => StitchLineSchema
  cloneComponent: (componentId: string) => void
  cloneHole: (holeId: string) => void
  cloneStitchLine: (stitchLineId: string) => void
  updatePocketLocks: (draft: PocketLocksDraftSchema) => void
  flip: (model: ModelObjectSchema, axis: FlipAxisSchema) => void
  deleteComponent: (componentId: string) => void
  deleteHole: (holeId: string) => void
  deleteStitchLine: (stitchLineId: string) => void
  moveComponent: (componentId: string, targetParentId: string, beforeComponentId: string | undefined) => void
  moveHole: (holeId: string, targetComponentId: string) => void
  moveStitchLineToComponent: (stitchLineId: string, componentId: string) => void
  moveStitchLineToHole: (stitchLineId: string, holeId: string) => void
  updateComponent: (component: ComponentSchema) => void
  updateHole: (hole: HoleSchema) => void
  updateStitchLine: (stitchLine: StitchLineSchema) => void
}

export const useSubProjectOperations = (): UseSubProjectOperationsOutput => {
  const operations = useSubProjectOperationsInternal()
  const { subProject } = useEditorContext()
  const { t } = useTranslation()

  return useMemo<UseSubProjectOperationsOutput>(() => {
    const source = isDefined(subProject) ? accessors.subProject(subProject) : undefined
    const executeOperation = <T>(operation: () => SubProjectOperationResultSchema<T>): T => {
      const result = operation()
      if (result.adjustments.length > 0) {
        toaster.create({
          type: 'warning',
          title: t.dialogs.pocketLocks.adjustedTitle,
          description: result.adjustments
            .map((adjustment) => {
              const sourceName = source?.optional.component(adjustment.sourceModelId)?.name ?? adjustment.sourceModelId
              const targets = adjustment.adjustedModelIds
                .map((id) => source?.optional.component(id)?.name ?? id)
                .join(', ')
              return `${t.dialogs.pocketLocks.group} ${adjustment.group} · ${t.dialogs.pocketLocks.columns[adjustment.property]}: ${sourceName} → ${targets}`
            })
            .join('\n'),
        })
      }
      return result.value
    }

    return {
      addComponent: (parentId, type, position) =>
        executeOperation(() => operations.addComponent(parentId, type, position)),
      addHole: (componentId) => executeOperation(() => operations.addHole(componentId)),
      addStitchLineToComponent: (componentId, type) =>
        executeOperation(() => operations.addStitchLineToComponent(componentId, type)),
      addStitchLineToHole: (holeId) => executeOperation(() => operations.addStitchLineToHole(holeId)),
      cloneComponent: (componentId) => executeOperation(() => operations.cloneComponent(componentId)),
      cloneHole: (holeId) => executeOperation(() => operations.cloneHole(holeId)),
      cloneStitchLine: (stitchLineId) => executeOperation(() => operations.cloneStitchLine(stitchLineId)),
      updatePocketLocks: (draft) => executeOperation(() => operations.updatePocketLocks(draft)),
      flip: (model, axis) => executeOperation(() => operations.flip(model, axis)),
      deleteComponent: (componentId) => executeOperation(() => operations.deleteComponent(componentId)),
      deleteHole: (holeId) => executeOperation(() => operations.deleteHole(holeId)),
      deleteStitchLine: (stitchLineId) => executeOperation(() => operations.deleteStitchLine(stitchLineId)),
      moveComponent: (componentId, targetParentId, beforeComponentId) =>
        executeOperation(() => operations.moveComponent(componentId, targetParentId, beforeComponentId)),
      moveHole: (holeId, targetComponentId) => executeOperation(() => operations.moveHole(holeId, targetComponentId)),
      moveStitchLineToComponent: (stitchLineId, componentId) =>
        executeOperation(() => operations.moveStitchLineToComponent(stitchLineId, componentId)),
      moveStitchLineToHole: (stitchLineId, holeId) =>
        executeOperation(() => operations.moveStitchLineToHole(stitchLineId, holeId)),
      updateComponent: (component) => executeOperation(() => operations.updateComponent(component)),
      updateHole: (hole) => executeOperation(() => operations.updateHole(hole)),
      updateStitchLine: (stitchLine) => executeOperation(() => operations.updateStitchLine(stitchLine)),
    }
  }, [operations, subProject, t])
}

type UseSubProjectOperationsInternalOutput = {
  [K in keyof UseSubProjectOperationsOutput]: (
    ...args: Parameters<UseSubProjectOperationsOutput[K]>
  ) => SubProjectOperationResultSchema<ReturnType<UseSubProjectOperationsOutput[K]>>
}

const useSubProjectOperationsInternal = (): UseSubProjectOperationsInternalOutput => {
  const { project, subProject, setSubProject } = useEditorContext()
  const { settings } = useGlobalSettings()
  const { recordChange, recordThrottledChange } = useSubProjectHistory()
  const { t } = useTranslation()

  const commitOperation = useCallback(
    <T>(
      before: SubProjectSchema,
      after: SubProjectSchema,
      model: ModelObjectSchema,
      value: T,
      historyKey?: SubProjectHistoryThrottleKeySchema,
    ): SubProjectOperationResultSchema<T> => {
      const result = applySubProjectLocks(before, after, model)
      if (result.subProject !== before) {
        if (isDefined(historyKey)) {
          recordThrottledChange(historyKey, before)
        } else {
          recordChange(before)
        }
        setSubProject(result.subProject)
      }
      return { value, adjustments: result.adjustments }
    },
    [recordChange, recordThrottledChange, setSubProject],
  )

  const addComponent = useCallback(
    (
      parentId: string,
      type: ComponentSchema['type'],
      position: ComponentInsertionPositionSchema,
    ): SubProjectOperationResultSchema<ComponentSchema> => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const component = createComponent({
        type,
        color: settings.edit.addBaseColor ? currentProject.colorSettings.leatherColor : undefined,
        id: id(),
        name: getUnusedComponentName(type, currentSubProject, t.defaultNames),
        stitchingSettings: currentProject.stitchingSettings,
      })

      return commitOperation(
        currentSubProject,
        addComponentPure(currentSubProject, { component, parentId, position }),
        accessors.subProject(currentSubProject).component(parentId),
        component,
      )
    },
    [project, commitOperation, settings.edit.addBaseColor, subProject, t],
  )

  const addStitchLineToComponent = useCallback(
    (componentId: string, type: StitchLineSchema['type']): SubProjectOperationResultSchema<StitchLineSchema> => {
      const currentSubProject = ensureSubProject(subProject)
      const stitchLine = createStitchLine(
        type,
        { targetId: componentId, targetType: 'component' },
        id(),
        getUnusedStitchLineName(type, currentSubProject, t.defaultNames),
      )

      return commitOperation(
        currentSubProject,
        addStitchLinePure(currentSubProject, { stitchLine }),
        stitchLine,
        stitchLine,
      )
    },
    [commitOperation, subProject, t],
  )

  const addStitchLineToHole = useCallback(
    (holeId: string): SubProjectOperationResultSchema<StitchLineSchema> => {
      const currentSubProject = ensureSubProject(subProject)
      const type: ComponentBoundsStitchLineSchema['type'] = 'component-bounds-stitch-line'
      const stitchLine = createStitchLine(
        type,
        { targetId: holeId, targetType: 'hole' },
        id(),
        getUnusedStitchLineName(type, currentSubProject, t.defaultNames),
      )

      return commitOperation(
        currentSubProject,
        addStitchLinePure(currentSubProject, { stitchLine }),
        stitchLine,
        stitchLine,
      )
    },
    [commitOperation, subProject, t],
  )

  const addHole = useCallback(
    (componentId: string): SubProjectOperationResultSchema<HoleSchema> => {
      const currentSubProject = ensureSubProject(subProject)
      const hole = createHole({
        componentId,
        id: id(),
        name: getUnusedHoleName(currentSubProject, t.defaultNames),
      })

      return commitOperation(currentSubProject, addHolePure(currentSubProject, { hole }), hole, hole)
    },
    [commitOperation, subProject, t],
  )

  const cloneComponent = useCallback(
    (componentId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)
      const clonedSubProject = cloneComponentPure(currentSubProject, {
        componentId,
        ids: {
          component: id,
          hole: id,
          stitchLine: id,
        },
        names: {
          component: getUnusedName,
          hole: getUnusedName,
          stitchLine: getUnusedName,
        },
        settings: {
          cloneComponentTree: true,
          cloneHoles: true,
          cloneStitchLines: true,
        },
      })

      return commitOperation(
        currentSubProject,
        clonedSubProject,
        accessors.subProject(currentSubProject).component(componentId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const deleteComponent = useCallback(
    (componentId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        deleteComponentPure(currentSubProject, { componentId }),
        accessors.subProject(currentSubProject).component(componentId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const cloneHole = useCallback(
    (holeId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        cloneHolePure(currentSubProject, { getUnusedId: id, getUnusedName, holeId }),
        accessors.subProject(currentSubProject).hole(holeId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const deleteHole = useCallback(
    (holeId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        deleteHolePure(currentSubProject, { holeId }),
        accessors.subProject(currentSubProject).hole(holeId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const cloneStitchLine = useCallback(
    (stitchLineId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        cloneStitchLinePure(currentSubProject, { getUnusedId: id, getUnusedName, stitchLineId }),
        accessors.subProject(currentSubProject).stitchLine(stitchLineId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const deleteStitchLine = useCallback(
    (stitchLineId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        deleteStitchLinePure(currentSubProject, { stitchLineId }),
        accessors.subProject(currentSubProject).stitchLine(stitchLineId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const moveComponent = useCallback(
    (
      componentId: string,
      targetParentId: string,
      beforeComponentId: string | undefined,
    ): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        moveComponentPure(currentSubProject, { beforeComponentId, componentId, targetParentId }),
        accessors.subProject(currentSubProject).component(componentId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const moveHole = useCallback(
    (holeId: string, targetComponentId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        moveHolePure(currentSubProject, { holeId, targetComponentId }),
        accessors.subProject(currentSubProject).hole(holeId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const moveStitchLineToComponent = useCallback(
    (stitchLineId: string, componentId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        moveStitchLinePure(currentSubProject, { stitchLineId, targetId: componentId, targetType: 'component' }),
        accessors.subProject(currentSubProject).stitchLine(stitchLineId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const moveStitchLineToHole = useCallback(
    (stitchLineId: string, holeId: string): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        moveStitchLinePure(currentSubProject, { stitchLineId, targetId: holeId, targetType: 'hole' }),
        accessors.subProject(currentSubProject).stitchLine(stitchLineId),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const updateComponent = useCallback(
    (component: ComponentSchema): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        updateComponentPure(currentSubProject, { component }),
        component,
        undefined,
        `component:${component.id}`,
      )
    },
    [commitOperation, subProject],
  )

  const flip = useCallback(
    (model: ModelObjectSchema, axis: FlipAxisSchema): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)
      const updatedSubProject = flipPure(currentSubProject, model, axis)
      return commitOperation(currentSubProject, updatedSubProject, model, undefined)
    },
    [commitOperation, subProject],
  )

  const updatePocketLocks = useCallback(
    (draft: PocketLocksDraftSchema): SubProjectOperationResultSchema<undefined> => {
      const current = ensureSubProject(subProject)
      return commitOperation(
        current,
        updatePocketLocksPure(current, draft),
        accessors.subProject(current).rootPanel(),
        undefined,
      )
    },
    [commitOperation, subProject],
  )

  const updateHole = useCallback(
    (hole: HoleSchema): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        updateHolePure(currentSubProject, { hole }),
        hole,
        undefined,
        `hole:${hole.id}`,
      )
    },
    [commitOperation, subProject],
  )

  const updateStitchLine = useCallback(
    (stitchLine: StitchLineSchema): SubProjectOperationResultSchema<undefined> => {
      const currentSubProject = ensureSubProject(subProject)

      return commitOperation(
        currentSubProject,
        updateStitchLinePure(currentSubProject, { stitchLine }),
        stitchLine,
        undefined,
        `stitch-line:${stitchLine.id}`,
      )
    },
    [commitOperation, subProject],
  )

  return useMemo<UseSubProjectOperationsInternalOutput>(
    () => ({
      addComponent,
      addHole,
      addStitchLineToComponent,
      addStitchLineToHole,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
      updatePocketLocks,
      flip,
      deleteComponent,
      deleteHole,
      deleteStitchLine,
      moveComponent,
      moveHole,
      moveStitchLineToComponent,
      moveStitchLineToHole,
      updateComponent,
      updateHole,
      updateStitchLine,
    }),
    [
      addComponent,
      addHole,
      addStitchLineToComponent,
      addStitchLineToHole,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
      updatePocketLocks,
      flip,
      deleteComponent,
      deleteHole,
      deleteStitchLine,
      moveComponent,
      moveHole,
      moveStitchLineToComponent,
      moveStitchLineToHole,
      updateComponent,
      updateHole,
      updateStitchLine,
    ],
  )
}

const ensureProject = (project: ProjectSchema | undefined): ProjectSchema => {
  if (!isDefined(project)) {
    throw new Error('A valid project is required')
  }

  return project
}

const ensureSubProject = (subProject: SubProjectSchema | undefined): SubProjectSchema => {
  if (!isDefined(subProject)) {
    throw new Error('A valid subproject is required')
  }

  return subProject
}
