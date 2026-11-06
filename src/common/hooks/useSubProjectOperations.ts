import { useCallback, useMemo } from 'react'
import { addConstraint as addConstraintPure } from '../operations/subProject/addConstraint'
import { addConstraintField as addConstraintFieldPure } from '../operations/subProject/addConstraintField'
import { addPocketOpening as addPocketOpeningPure } from '../operations/subProject/addPocketOpening'
import { deleteConstraint as deleteConstraintPure } from '../operations/subProject/deleteConstraint'
import { deleteConstraintField as deleteConstraintFieldPure } from '../operations/subProject/deleteConstraintField'
import { deletePocketOpening as deletePocketOpeningPure } from '../operations/subProject/deletePocketOpening'
import { updatePocketOpening as updatePocketOpeningPure } from '../operations/subProject/updatePocketOpening'
import type { ConstraintSchema } from '../schemas/constraints'
import type { ConstraintFieldInputSchema, ReadonlyModelObjectFactorySchema } from '../schemas/factory'
import type { NameGeneratorSchema } from '../schemas/idGenerator'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import { NameGenerator } from '../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../utils/factory/ReadonlyModelObjectFactory'

import { useEditorContext } from '../contexts/EditorContext'
import {
  addComponent as addComponentPure,
  type ComponentInsertionPositionSchema,
} from '../operations/subProject/addComponent'
import { addHole as addHolePure } from '../operations/subProject/addHole'
import { addStitchLine as addStitchLinePure } from '../operations/subProject/addStitchLine'
import { cloneComponent as cloneComponentPure } from '../operations/subProject/cloneComponent'
import { cloneHole as cloneHolePure } from '../operations/subProject/cloneHole'
import { clonePocketOpening as clonePocketOpeningPure } from '../operations/subProject/clonePocketOpening'
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
import type { FlipAxisSchema } from '../schemas/common'
import type { ComponentSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { IdGeneratorSchema } from '../schemas/idGenerator'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { ProjectSchema } from '../schemas/project'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { IdGenerator } from '../utils/random/IdGenerator'
import { useGlobalSettings } from './useGlobalSettings'
import { useSubProjectHistory } from './useSubProjectHistory'
import { useTranslation } from './useTranslation'

export type UseSubProjectOperationsOutput = {
  addConstraint: (type: ConstraintSchema['type']) => void
  deleteConstraint: (constraintId: string) => void
  addConstraintField: (constraintId: string, field: ConstraintFieldInputSchema) => void
  deleteConstraintField: (constraintId: string, fieldId: string) => void
  addPocketOpening: (type: PocketOpeningSchema['type']) => void
  clonePocketOpening: (openingId: string) => void
  setDefaultPocketOpening: (openingId: string) => void
  updatePocketOpening: (opening: PocketOpeningSchema) => void
  deletePocketOpening: (openingId: string) => void
  addComponent: (parentId: string, type: ComponentSchema['type'], position: ComponentInsertionPositionSchema) => void
  addHole: (componentId: string) => void
  addStitchLineToComponent: (componentId: string, type: StitchLineSchema['type']) => void
  addStitchLineToHole: (holeId: string) => void
  cloneComponent: (componentId: string) => void
  cloneHole: (holeId: string) => void
  cloneStitchLine: (stitchLineId: string) => void
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
  const idGenerator = useMemo<IdGeneratorSchema>(() => new IdGenerator(), [])
  const nameGenerator = useMemo<NameGeneratorSchema>(() => new NameGenerator(t.defaultNames), [t.defaultNames])
  const modelFactory = useMemo<ReadonlyModelObjectFactorySchema>(
    () => new ReadonlyModelObjectFactory(idGenerator, nameGenerator),
    [idGenerator, nameGenerator],
  )

  const addConstraint = useCallback(
    (type: ConstraintSchema['type']): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updated = addConstraintPure(currentSubProject, { type, modelFactory })
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [modelFactory, recordChange, setSubProject, subProject],
  )

  const deleteConstraint = useCallback(
    (constraintId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updated = deleteConstraintPure(currentSubProject, { constraintId })
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [recordChange, setSubProject, subProject],
  )

  const addConstraintField = useCallback(
    (constraintId: string, field: ConstraintFieldInputSchema): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updated = addConstraintFieldPure(currentSubProject, { constraintId, field, modelFactory })
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [modelFactory, recordChange, setSubProject, subProject],
  )

  const deleteConstraintField = useCallback(
    (constraintId: string, fieldId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updated = deleteConstraintFieldPure(currentSubProject, { constraintId, fieldId })
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [recordChange, setSubProject, subProject],
  )

  const addPocketOpening = useCallback(
    (type: PocketOpeningSchema['type']): void => {
      const currentSubProject = ensureSubProject(subProject)
      recordChange(currentSubProject)
      setSubProject(addPocketOpeningPure(currentSubProject, { type, modelFactory }))
    },
    [modelFactory, recordChange, setSubProject, subProject],
  )

  const setDefaultPocketOpening = useCallback(
    (openingId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      if (
        currentSubProject.defaultPocketOpening === openingId ||
        !isDefined(accessors.subProject(currentSubProject).optional.pocketOpening.byId(openingId))
      ) {
        return
      }
      recordChange(currentSubProject)
      setSubProject({ ...currentSubProject, defaultPocketOpening: openingId })
    },
    [recordChange, setSubProject, subProject],
  )

  const clonePocketOpening = useCallback(
    (openingId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updated = clonePocketOpeningPure(currentSubProject, { openingId, nameGenerator })
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [nameGenerator, recordChange, setSubProject, subProject],
  )

  const updatePocketOpening = useCallback(
    (opening: PocketOpeningSchema): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updated = updatePocketOpeningPure(currentSubProject, { opening })
      if (updated === currentSubProject) {
        return
      }
      recordThrottledUpdate(`opening:${opening.id}`, currentSubProject)
      setSubProject(updated)
    },
    [recordThrottledUpdate, setSubProject, subProject],
  )

  const deletePocketOpening = useCallback(
    (openingId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      const updated = deletePocketOpeningPure(currentSubProject, { openingId })
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [recordChange, setSubProject, subProject],
  )

  const addComponent = useCallback(
    (parentId: string, type: ComponentSchema['type'], position: ComponentInsertionPositionSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      recordChange(currentSubProject)
      setSubProject(
        addComponentPure(currentSubProject, {
          parentId,
          type,
          position,
          modelFactory,
          color: settings.edit.addBaseColor ? currentProject.colorSettings.leatherColor : undefined,
          stitchingSettings: currentProject.stitchingSettings,
        }),
      )
    },
    [modelFactory, project, recordChange, setSubProject, settings.edit.addBaseColor, subProject],
  )

  const addStitchLineToComponent = useCallback(
    (componentId: string, type: StitchLineSchema['type']): void => {
      const currentSubProject = ensureSubProject(subProject)
      recordChange(currentSubProject)
      setSubProject(
        addStitchLinePure(currentSubProject, { type, targetId: componentId, targetType: 'component', modelFactory }),
      )
    },
    [modelFactory, recordChange, setSubProject, subProject],
  )

  const addStitchLineToHole = useCallback(
    (holeId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      recordChange(currentSubProject)
      setSubProject(
        addStitchLinePure(currentSubProject, {
          type: 'component-bounds-stitch-line',
          targetId: holeId,
          targetType: 'hole',
          modelFactory,
        }),
      )
    },
    [modelFactory, recordChange, setSubProject, subProject],
  )

  const addHole = useCallback(
    (componentId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      recordChange(currentSubProject)
      setSubProject(addHolePure(currentSubProject, { componentId, modelFactory }))
    },
    [modelFactory, recordChange, setSubProject, subProject],
  )

  const cloneComponent = useCallback(
    (componentId: string): void => {
      const currentSubProject = ensureSubProject(subProject)
      const clonedSubProject = cloneComponentPure(currentSubProject, {
        componentId,
        nameGenerator,
        settings: {
          cloneComponentTree: true,
          cloneHoles: true,
          cloneStitchLines: true,
        },
      })

      recordChange(currentSubProject)
      setSubProject(clonedSubProject)
    },
    [nameGenerator, recordChange, setSubProject, subProject],
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
      setSubProject(
        cloneHolePure(currentSubProject, {
          nameGenerator,
          holeId,
        }),
      )
    },
    [nameGenerator, recordChange, setSubProject, subProject],
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
      setSubProject(
        cloneStitchLinePure(currentSubProject, {
          nameGenerator,
          stitchLineId,
        }),
      )
    },
    [nameGenerator, recordChange, setSubProject, subProject],
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
      addConstraint,
      deleteConstraint,
      addConstraintField,
      deleteConstraintField,
      addPocketOpening,
      clonePocketOpening,
      setDefaultPocketOpening,
      updatePocketOpening,
      deletePocketOpening,
      addComponent,
      addHole,
      addStitchLineToComponent,
      addStitchLineToHole,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
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
      addConstraint,
      deleteConstraint,
      addConstraintField,
      deleteConstraintField,
      addPocketOpening,
      clonePocketOpening,
      setDefaultPocketOpening,
      updatePocketOpening,
      deletePocketOpening,
      addComponent,
      addHole,
      addStitchLineToComponent,
      addStitchLineToHole,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
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
