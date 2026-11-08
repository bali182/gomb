import { useCallback, useMemo } from 'react'
import { useEditorContext } from '../contexts/EditorContext'
import { addComponent as addComponentPure } from '../operations/subProject/addComponent'
import { addComponents as addComponentsPure } from '../operations/subProject/addComponents'
import { addConstraint as addConstraintPure } from '../operations/subProject/addConstraint'
import { addConstraintFields as addConstraintFieldsPure } from '../operations/subProject/addConstraintFields'
import { addHole as addHolePure } from '../operations/subProject/addHole'
import { addPocketOpening as addPocketOpeningPure } from '../operations/subProject/addPocketOpening'
import { addStitchLine as addStitchLinePure } from '../operations/subProject/addStitchLine'
import { cloneComponent as cloneComponentPure } from '../operations/subProject/cloneComponent'
import { cloneHole as cloneHolePure } from '../operations/subProject/cloneHole'
import { clonePocketOpening as clonePocketOpeningPure } from '../operations/subProject/clonePocketOpening'
import { cloneStitchLine as cloneStitchLinePure } from '../operations/subProject/cloneStitchLine'
import { deleteComponent as deleteComponentPure } from '../operations/subProject/deleteComponent'
import { deleteConstraint as deleteConstraintPure } from '../operations/subProject/deleteConstraint'
import { deleteConstraintField as deleteConstraintFieldPure } from '../operations/subProject/deleteConstraintField'
import { deleteHole as deleteHolePure } from '../operations/subProject/deleteHole'
import { deletePocketOpening as deletePocketOpeningPure } from '../operations/subProject/deletePocketOpening'
import { deleteStitchLine as deleteStitchLinePure } from '../operations/subProject/deleteStitchLine'
import { flip as flipPure } from '../operations/subProject/flip'
import { moveComponent as moveComponentPure } from '../operations/subProject/moveComponent'
import { moveHole as moveHolePure } from '../operations/subProject/moveHole'
import { moveStitchLine as moveStitchLinePure } from '../operations/subProject/moveStitchLine'
import { setDefaultPocketOpening as setDefaultPocketOpeningPure } from '../operations/subProject/setDefaultPocketOpening'
import { updateComponent as updateComponentPure } from '../operations/subProject/updateComponent'
import { updateHole as updateHolePure } from '../operations/subProject/updateHole'
import { updatePocketOpening as updatePocketOpeningPure } from '../operations/subProject/updatePocketOpening'
import { updateStitchLine as updateStitchLinePure } from '../operations/subProject/updateStitchLine'
import type { ReadonlyModelObjectFactorySchema } from '../schemas/factory'
import type { IdGeneratorSchema, NameGeneratorSchema } from '../schemas/idGenerator'
import type {
  AddComponentParamsSchema,
  AddComponentsParamsSchema,
  AddConstraintFieldsParamsSchema,
  AddConstraintParamsSchema,
  AddHoleParamsSchema,
  AddPocketOpeningParamsSchema,
  AddStitchLineParamsSchema,
  BaseOperationParamsSchema,
  CloneComponentParamsSchema,
  CloneHoleParamsSchema,
  ClonePocketOpeningParamsSchema,
  CloneStitchLineParamsSchema,
  DeleteComponentParamsSchema,
  DeleteConstraintFieldParamsSchema,
  DeleteConstraintParamsSchema,
  DeleteHoleParamsSchema,
  DeletePocketOpeningParamsSchema,
  DeleteStitchLineParamsSchema,
  FlipParamsSchema,
  MoveComponentParamsSchema,
  MoveHoleParamsSchema,
  MoveStitchLineParamsSchema,
  SetDefaultPocketOpeningParamsSchema,
  UpdateComponentParamsSchema,
  UpdateHoleParamsSchema,
  UpdatePocketOpeningParamsSchema,
  UpdateStitchLineParamsSchema,
} from '../schemas/operations'
import type { ProjectSchema } from '../schemas/project'
import type { SubProjectSchema } from '../schemas/subProject'
import { ModelObjectFactory } from '../utils/factory/ModelObjectFactory'
import { NameGenerator } from '../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../utils/factory/ReadonlyModelObjectFactory'
import { isDefined } from '../utils/isDefined'
import { IdGenerator } from '../utils/random/IdGenerator'
import { useGlobalSettings } from './useGlobalSettings'
import { useSubProjectHistory } from './useSubProjectHistory'
import { useTranslation } from './useTranslation'

export type UseSubProjectOperationsOutput = {
  addComponent: (params: AddComponentParamsSchema) => void
  addComponents: (params: AddComponentsParamsSchema) => void
  addConstraint: (params: AddConstraintParamsSchema) => void
  addConstraintFields: (params: AddConstraintFieldsParamsSchema) => void
  addHole: (params: AddHoleParamsSchema) => void
  addPocketOpening: (params: AddPocketOpeningParamsSchema) => void
  addStitchLine: (params: AddStitchLineParamsSchema) => void
  cloneComponent: (params: CloneComponentParamsSchema) => void
  cloneHole: (params: CloneHoleParamsSchema) => void
  cloneStitchLine: (params: CloneStitchLineParamsSchema) => void
  clonePocketOpening: (params: ClonePocketOpeningParamsSchema) => void
  deleteComponent: (params: DeleteComponentParamsSchema) => void
  deleteHole: (params: DeleteHoleParamsSchema) => void
  deleteStitchLine: (params: DeleteStitchLineParamsSchema) => void
  deletePocketOpening: (params: DeletePocketOpeningParamsSchema) => void
  deleteConstraint: (params: DeleteConstraintParamsSchema) => void
  deleteConstraintField: (params: DeleteConstraintFieldParamsSchema) => void
  setDefaultPocketOpening: (params: SetDefaultPocketOpeningParamsSchema) => void
  moveComponent: (params: MoveComponentParamsSchema) => void
  moveHole: (params: MoveHoleParamsSchema) => void
  moveStitchLine: (params: MoveStitchLineParamsSchema) => void
  updateComponent: (params: UpdateComponentParamsSchema) => void
  updateHole: (params: UpdateHoleParamsSchema) => void
  updateStitchLine: (params: UpdateStitchLineParamsSchema) => void
  updatePocketOpening: (params: UpdatePocketOpeningParamsSchema) => void
  flip: (params: FlipParamsSchema) => void
}

export const useSubProjectOperations = (): UseSubProjectOperationsOutput => {
  const { project, subProject, setSubProject } = useEditorContext()
  const { settings } = useGlobalSettings()
  const { recordChange, recordThrottledChange: recordThrottledUpdate } = useSubProjectHistory()
  const { t } = useTranslation()
  const idGenerator = useMemo<IdGeneratorSchema>(() => new IdGenerator(), [])
  const nameGenerator = useMemo<NameGeneratorSchema>(() => new NameGenerator(t.defaultNames), [t.defaultNames])
  const readonlyFactory = useMemo<ReadonlyModelObjectFactorySchema>(
    () => new ReadonlyModelObjectFactory(idGenerator, nameGenerator),
    [idGenerator, nameGenerator],
  )

  const createBaseOperationParams = useCallback(
    (project: ProjectSchema, subProject: SubProjectSchema): BaseOperationParamsSchema => ({
      project,
      subProject,
      settings,
      id: idGenerator,
      name: nameGenerator,
      factory: new ModelObjectFactory(idGenerator, nameGenerator),
      readonlyFactory,
    }),
    [settings, idGenerator, nameGenerator, readonlyFactory],
  )

  const addComponent = useCallback(
    (params: AddComponentParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = addComponentPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const addComponents = useCallback(
    (params: AddComponentsParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = addComponentsPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const addConstraint = useCallback(
    (params: AddConstraintParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = addConstraintPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const addConstraintFields = useCallback(
    (params: AddConstraintFieldsParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = addConstraintFieldsPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const addHole = useCallback(
    (params: AddHoleParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = addHolePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const addPocketOpening = useCallback(
    (params: AddPocketOpeningParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = addPocketOpeningPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const addStitchLine = useCallback(
    (params: AddStitchLineParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = addStitchLinePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const cloneComponent = useCallback(
    (params: CloneComponentParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = cloneComponentPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const cloneHole = useCallback(
    (params: CloneHoleParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = cloneHolePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const cloneStitchLine = useCallback(
    (params: CloneStitchLineParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = cloneStitchLinePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const clonePocketOpening = useCallback(
    (params: ClonePocketOpeningParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = clonePocketOpeningPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const deleteComponent = useCallback(
    (params: DeleteComponentParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = deleteComponentPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const deleteHole = useCallback(
    (params: DeleteHoleParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = deleteHolePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const deleteStitchLine = useCallback(
    (params: DeleteStitchLineParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = deleteStitchLinePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const deletePocketOpening = useCallback(
    (params: DeletePocketOpeningParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = deletePocketOpeningPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const deleteConstraint = useCallback(
    (params: DeleteConstraintParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = deleteConstraintPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const deleteConstraintField = useCallback(
    (params: DeleteConstraintFieldParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = deleteConstraintFieldPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const setDefaultPocketOpening = useCallback(
    (params: SetDefaultPocketOpeningParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = setDefaultPocketOpeningPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const moveComponent = useCallback(
    (params: MoveComponentParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = moveComponentPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const moveHole = useCallback(
    (params: MoveHoleParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = moveHolePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const moveStitchLine = useCallback(
    (params: MoveStitchLineParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = moveStitchLinePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const updateComponent = useCallback(
    (params: UpdateComponentParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = updateComponentPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordThrottledUpdate(`component:${params.component.id}`, currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordThrottledUpdate, setSubProject],
  )

  const updateHole = useCallback(
    (params: UpdateHoleParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = updateHolePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordThrottledUpdate(`hole:${params.hole.id}`, currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordThrottledUpdate, setSubProject],
  )

  const updateStitchLine = useCallback(
    (params: UpdateStitchLineParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = updateStitchLinePure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordThrottledUpdate(`stitch-line:${params.stitchLine.id}`, currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordThrottledUpdate, setSubProject],
  )

  const updatePocketOpening = useCallback(
    (params: UpdatePocketOpeningParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = updatePocketOpeningPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordThrottledUpdate(`opening:${params.opening.id}`, currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordThrottledUpdate, setSubProject],
  )

  const flip = useCallback(
    (params: FlipParamsSchema): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = flipPure(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  return useMemo<UseSubProjectOperationsOutput>(
    () => ({
      addComponent,
      addComponents,
      addConstraint,
      addConstraintFields,
      addHole,
      addPocketOpening,
      addStitchLine,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
      clonePocketOpening,
      deleteComponent,
      deleteHole,
      deleteStitchLine,
      deletePocketOpening,
      deleteConstraint,
      deleteConstraintField,
      setDefaultPocketOpening,
      moveComponent,
      moveHole,
      moveStitchLine,
      updateComponent,
      updateHole,
      updateStitchLine,
      updatePocketOpening,
      flip,
    }),
    [
      addComponent,
      addComponents,
      addConstraint,
      addConstraintFields,
      addHole,
      addPocketOpening,
      addStitchLine,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
      clonePocketOpening,
      deleteComponent,
      deleteHole,
      deleteStitchLine,
      deletePocketOpening,
      deleteConstraint,
      deleteConstraintField,
      setDefaultPocketOpening,
      moveComponent,
      moveHole,
      moveStitchLine,
      updateComponent,
      updateHole,
      updateStitchLine,
      updatePocketOpening,
      flip,
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
