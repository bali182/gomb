import { useCallback, useMemo } from 'react'

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
import { updateStitchLine as updateStitchLinePure } from '../operations/subProject/updateStitchLine'
import { createComponent } from '../operations/subProject/utils/createComponent'
import { createHole } from '../operations/subProject/utils/createHole'
import { createStitchLine } from '../operations/subProject/utils/createStitchLine'
import { getUnusedComponentName } from '../operations/subProject/utils/getUnusedComponentName'
import { getUnusedHoleName } from '../operations/subProject/utils/getUnusedHoleName'
import { getUnusedName } from '../operations/subProject/utils/getUnusedName'
import type { FlipAxisSchema } from '../schemas/common'
import type { ComponentSchema, PocketSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { PocketSettingsCopySelectionSchema, PocketSettingsCopyTargetsSchema } from '../schemas/pocketCopy'
import type { ProjectSchema } from '../schemas/project'
import type { ComponentBoundsStitchLineSchema, StitchLineSchema, TPocketStitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { getUnusedStitchLineName } from '../utils/getUnusedStitchLineName'
import { id } from '../utils/id'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
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
  copyPocketSettings: (sourcePocketId: string, targets: Partial<PocketSettingsCopyTargetsSchema>) => void
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
  const { project, subProject, setSubProject } = useEditorContext()
  const { settings } = useGlobalSettings()
  const { recordChange, recordThrottledChange: recordThrottledUpdate } = useSubProjectHistory()
  const { t } = useTranslation()

  const addComponent = useCallback(
    (parentId: string, type: ComponentSchema['type'], position: ComponentInsertionPositionSchema): ComponentSchema => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const component = createComponent({
        type,
        color: settings.edit.addBaseColor ? currentProject.colorSettings.leatherColor : undefined,
        id: id(),
        name: getUnusedComponentName(type, currentSubProject, t.defaultNames),
        stitchingSettings: currentProject.stitchingSettings,
      })

      recordChange(currentSubProject)
      setSubProject(
        addComponentPure(currentSubProject, {
          component,
          parentId,
          position,
        }),
      )

      return component
    },
    [project, recordChange, setSubProject, settings.edit.addBaseColor, subProject, t],
  )

  const addStitchLineToComponent = useCallback(
    (componentId: string, type: StitchLineSchema['type']): StitchLineSchema => {
      const currentSubProject = ensureSubProject(subProject)
      const stitchLine = createStitchLine(
        type,
        { targetId: componentId, targetType: 'component' },
        id(),
        getUnusedStitchLineName(type, currentSubProject, t.defaultNames),
      )

      recordChange(currentSubProject)
      setSubProject(addStitchLinePure(currentSubProject, { stitchLine }))

      return stitchLine
    },
    [recordChange, setSubProject, subProject, t],
  )

  const addStitchLineToHole = useCallback(
    (holeId: string): StitchLineSchema => {
      const currentSubProject = ensureSubProject(subProject)
      const type: ComponentBoundsStitchLineSchema['type'] = 'component-bounds-stitch-line'
      const stitchLine = createStitchLine(
        type,
        { targetId: holeId, targetType: 'hole' },
        id(),
        getUnusedStitchLineName(type, currentSubProject, t.defaultNames),
      )

      recordChange(currentSubProject)
      setSubProject(addStitchLinePure(currentSubProject, { stitchLine }))

      return stitchLine
    },
    [recordChange, setSubProject, subProject, t],
  )

  const addHole = useCallback(
    (componentId: string): HoleSchema => {
      const currentSubProject = ensureSubProject(subProject)
      const hole = createHole({
        componentId,
        id: id(),
        name: getUnusedHoleName(currentSubProject, t.defaultNames),
      })

      recordChange(currentSubProject)
      setSubProject(addHolePure(currentSubProject, { hole }))

      return hole
    },
    [recordChange, setSubProject, subProject, t],
  )

  const cloneComponent = useCallback(
    (componentId: string): void => {
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

      recordChange(currentSubProject)
      setSubProject(clonedSubProject)
    },
    [recordChange, setSubProject, subProject],
  )

  const deleteComponent = useCallback(
    (componentId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(deleteComponentPure(currentSubProject, { componentId }))
    },
    [recordChange, setSubProject, subProject],
  )

  const cloneHole = useCallback(
    (holeId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(cloneHolePure(currentSubProject, { getUnusedId: id, getUnusedName, holeId }))
    },
    [recordChange, setSubProject, subProject],
  )

  const deleteHole = useCallback(
    (holeId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(deleteHolePure(currentSubProject, { holeId }))
    },
    [recordChange, setSubProject, subProject],
  )

  const cloneStitchLine = useCallback(
    (stitchLineId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(cloneStitchLinePure(currentSubProject, { getUnusedId: id, getUnusedName, stitchLineId }))
    },
    [recordChange, setSubProject, subProject],
  )

  const deleteStitchLine = useCallback(
    (stitchLineId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(deleteStitchLinePure(currentSubProject, { stitchLineId }))
    },
    [recordChange, setSubProject, subProject],
  )

  const moveComponent = useCallback(
    (componentId: string, targetParentId: string, beforeComponentId: string | undefined): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(moveComponentPure(currentSubProject, { beforeComponentId, componentId, targetParentId }))
    },
    [recordChange, setSubProject, subProject],
  )

  const moveHole = useCallback(
    (holeId: string, targetComponentId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(moveHolePure(currentSubProject, { holeId, targetComponentId }))
    },
    [recordChange, setSubProject, subProject],
  )

  const moveStitchLineToComponent = useCallback(
    (stitchLineId: string, componentId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(
        moveStitchLinePure(currentSubProject, {
          stitchLineId,
          targetId: componentId,
          targetType: 'component',
        }),
      )
    },
    [recordChange, setSubProject, subProject],
  )

  const moveStitchLineToHole = useCallback(
    (stitchLineId: string, holeId: string): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordChange(currentSubProject)
      setSubProject(moveStitchLinePure(currentSubProject, { stitchLineId, targetId: holeId, targetType: 'hole' }))
    },
    [recordChange, setSubProject, subProject],
  )

  const updateComponent = useCallback(
    (component: ComponentSchema): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordThrottledUpdate(`component:${component.id}`, currentSubProject)
      setSubProject(updateComponentPure(currentSubProject, { component }))
    },
    [recordThrottledUpdate, setSubProject, subProject],
  )

  const flip = useCallback(
    (model: ModelObjectSchema, axis: FlipAxisSchema): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updatedSubProject = flipPure(currentSubProject, model, axis)
      if (updatedSubProject === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updatedSubProject)
    },
    [recordChange, setSubProject, subProject],
  )

  const copyPocketSettings = useCallback(
    (sourcePocketId: string, targets: Partial<PocketSettingsCopyTargetsSchema>): void => {
      const currentSubProject = ensureSubProject(subProject)
      const accessor = accessors.subProject(currentSubProject)
      const source = accessor.pocket(sourcePocketId)
      const cluster = accessor.optional.parent(sourcePocketId)
      if (!isDefined(cluster) || !narrowers.is.pocketCluster(cluster)) {
        return
      }

      const sourceStitchLines = accessor.tPocketStitchLines(sourcePocketId)
      const updatedSubProject = cluster.children.reduce<SubProjectSchema>((current, pocketId) => {
        const selection = targets[pocketId]
        if (pocketId === sourcePocketId || !isDefined(selection)) {
          return current
        }

        const target = accessors.subProject(current).pocket(pocketId)
        const updatedPocket = copyPocketFields(source, target, selection)
        const withPocket =
          updatedPocket === target ? current : updateComponentPure(current, { component: updatedPocket })
        if (
          !selection.copyStitching ||
          !narrowers.is.tPocket(source) ||
          !narrowers.is.tPocket(target) ||
          sourceStitchLines.length === 0
        ) {
          return withPocket
        }

        return copyPocketStitchLines(withPocket, sourceStitchLines, target.id, selection.overwriteStitching)
      }, currentSubProject)

      if (updatedSubProject === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updatedSubProject)
    },
    [recordChange, setSubProject, subProject],
  )

  const updateHole = useCallback(
    (hole: HoleSchema): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordThrottledUpdate(`hole:${hole.id}`, currentSubProject)
      setSubProject(updateHolePure(currentSubProject, { hole }))
    },
    [recordThrottledUpdate, setSubProject, subProject],
  )

  const updateStitchLine = useCallback(
    (stitchLine: StitchLineSchema): void => {
      const currentSubProject = ensureSubProject(subProject)

      recordThrottledUpdate(`stitch-line:${stitchLine.id}`, currentSubProject)
      setSubProject(updateStitchLinePure(currentSubProject, { stitchLine }))
    },
    [recordThrottledUpdate, setSubProject, subProject],
  )

  return useMemo<UseSubProjectOperationsOutput>(
    () => ({
      addComponent,
      addHole,
      addStitchLineToComponent,
      addStitchLineToHole,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
      copyPocketSettings,
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
      copyPocketSettings,
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

const copyPocketFields = (
  source: PocketSchema,
  target: PocketSchema,
  selection: PocketSettingsCopySelectionSchema,
): PocketSchema => {
  let updatedPocket = target
  if (selection.copyPocketItem) {
    updatedPocket = {
      ...updatedPocket,
      itemId: source.itemId,
      itemOrientation: source.itemOrientation,
      itemCrossAxisOffset: source.itemCrossAxisOffset,
      itemOpeningOffset: source.itemOpeningOffset,
    }
  }
  if (selection.copyOpening) {
    updatedPocket = { ...updatedPocket, opening: { ...source.opening } }
  }
  if (selection.copyShape && narrowers.is.tPocket(source) && narrowers.is.tPocket(updatedPocket)) {
    updatedPocket = {
      ...updatedPocket,
      tPocketTabWidth: source.tPocketTabWidth,
      tPocketTaper: source.tPocketTaper,
    }
  }
  return updatedPocket
}

const copyPocketStitchLines = (
  subProject: SubProjectSchema,
  sourceStitchLines: readonly TPocketStitchLineSchema[],
  targetPocketId: string,
  overwrite: boolean,
): SubProjectSchema => {
  const existingStitchLines = accessors.subProject(subProject).tPocketStitchLines(targetPocketId)
  const withoutExisting = overwrite
    ? existingStitchLines.reduce<SubProjectSchema>(
        (current, stitchLine) => deleteStitchLinePure(current, { stitchLineId: stitchLine.id }),
        subProject,
      )
    : subProject

  return sourceStitchLines.reduce<SubProjectSchema>((current, sourceStitchLine) => {
    const stitchLine: TPocketStitchLineSchema = {
      ...sourceStitchLine,
      id: id(),
      name: getUnusedName(sourceStitchLine.name, new Set(current.stitchLines.map((candidate) => candidate.name))),
      targetId: targetPocketId,
    }
    return addStitchLinePure(current, { stitchLine })
  }, withoutExisting)
}
