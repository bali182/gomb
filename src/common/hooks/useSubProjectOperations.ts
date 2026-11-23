import { useCallback, useMemo } from 'react'
import { useEditorContext } from '../contexts/EditorContext'
import { addBinding as addBindingPure } from '../operations/subProject/addBinding'
import { addBindingFields as addBindingFieldsPure } from '../operations/subProject/addBindingFields'
import { addBindings as addBindingsPure } from '../operations/subProject/addBindings'
import { addComponent as addComponentPure } from '../operations/subProject/addComponent'
import { addComponents as addComponentsPure } from '../operations/subProject/addComponents'
import { addHole as addHolePure } from '../operations/subProject/addHole'
import { addPocketOpening as addPocketOpeningPure } from '../operations/subProject/addPocketOpening'
import { addStitchLine as addStitchLinePure } from '../operations/subProject/addStitchLine'
import { attachPocketOpening as attachPocketOpeningPure } from '../operations/subProject/attachPocketOpening'
import { cloneComponent as cloneComponentPure } from '../operations/subProject/cloneComponent'
import { cloneHole as cloneHolePure } from '../operations/subProject/cloneHole'
import { clonePocketOpening as clonePocketOpeningPure } from '../operations/subProject/clonePocketOpening'
import { cloneStitchLine as cloneStitchLinePure } from '../operations/subProject/cloneStitchLine'
import { deleteBinding as deleteBindingPure } from '../operations/subProject/deleteBinding'
import { deleteBindingField as deleteBindingFieldPure } from '../operations/subProject/deleteBindingField'
import { deleteComponent as deleteComponentPure } from '../operations/subProject/deleteComponent'
import { deleteHole as deleteHolePure } from '../operations/subProject/deleteHole'
import { deleteModelBindingFields as deleteModelBindingFieldsPure } from '../operations/subProject/deleteModelBindingFields'
import { deletePocketOpening as deletePocketOpeningPure } from '../operations/subProject/deletePocketOpening'
import { deleteStitchLine as deleteStitchLinePure } from '../operations/subProject/deleteStitchLine'
import { flip as flipPure } from '../operations/subProject/flip'
import { moveComponent as moveComponentPure } from '../operations/subProject/moveComponent'
import { moveHole as moveHolePure } from '../operations/subProject/moveHole'
import { moveStitchLine as moveStitchLinePure } from '../operations/subProject/moveStitchLine'
import { setCornerRadiusBinding as setCornerRadiusBindingPure } from '../operations/subProject/setCornerRadiusBinding'
import { setDefaultPocketOpening as setDefaultPocketOpeningPure } from '../operations/subProject/setDefaultPocketOpening'
import { setStretchBinding as setStretchBindingPure } from '../operations/subProject/setStretchBinding'
import { updateComponent as updateComponentPure } from '../operations/subProject/updateComponent'
import { updateHole as updateHolePure } from '../operations/subProject/updateHole'
import { updatePocketOpening as updatePocketOpeningPure } from '../operations/subProject/updatePocketOpening'
import { updateStitchLine as updateStitchLinePure } from '../operations/subProject/updateStitchLine'
import type { ReadonlyModelObjectFactorySchema } from '../schemas/factory'
import type { IdGeneratorSchema, NameGeneratorSchema } from '../schemas/idGenerator'
import type {
  AddBindingFieldsParamsSchema,
  AddBindingParamsSchema,
  AddBindingsParamsSchema,
  AddComponentParamsSchema,
  AddComponentsParamsSchema,
  AddHoleParamsSchema,
  AddPocketOpeningParamsSchema,
  AddStitchLineParamsSchema,
  AttachPocketOpeningParamsSchema,
  BaseSubProjectOperationParamsSchema,
  CloneComponentParamsSchema,
  CloneHoleParamsSchema,
  ClonePocketOpeningParamsSchema,
  CloneStitchLineParamsSchema,
  DeleteBindingFieldParamsSchema,
  DeleteBindingParamsSchema,
  DeleteComponentParamsSchema,
  DeleteHoleParamsSchema,
  DeleteModelBindingFieldsParamsSchema,
  DeletePocketOpeningParamsSchema,
  DeleteStitchLineParamsSchema,
  FlipParamsSchema,
  MoveComponentParamsSchema,
  MoveHoleParamsSchema,
  MoveStitchLineParamsSchema,
  SetCornerRadiusBindingParamsSchema,
  SetDefaultPocketOpeningParamsSchema,
  SetStretchBindingParamsSchema,
  SubProjectOperationSchema,
  UpdateComponentParamsSchema,
  UpdateHoleParamsSchema,
  UpdatePocketOpeningParamsSchema,
  UpdateStitchLineParamsSchema,
} from '../schemas/operations'
import type { ProjectSchema } from '../schemas/project'
import type { SubProjectSchema } from '../schemas/subProject'
import type { SubProjectHistoryThrottleKeySchema } from '../schemas/subProjectHistory'
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
  addBinding: (params: AddBindingParamsSchema) => void
  addBindings: (params: AddBindingsParamsSchema) => void
  addBindingFields: (params: AddBindingFieldsParamsSchema) => void
  addHole: (params: AddHoleParamsSchema) => void
  addPocketOpening: (params: AddPocketOpeningParamsSchema) => void
  addStitchLine: (params: AddStitchLineParamsSchema) => void
  attachPocketOpening: (params: AttachPocketOpeningParamsSchema) => void
  cloneComponent: (params: CloneComponentParamsSchema) => void
  cloneHole: (params: CloneHoleParamsSchema) => void
  cloneStitchLine: (params: CloneStitchLineParamsSchema) => void
  clonePocketOpening: (params: ClonePocketOpeningParamsSchema) => void
  deleteComponent: (params: DeleteComponentParamsSchema) => void
  deleteHole: (params: DeleteHoleParamsSchema) => void
  deleteStitchLine: (params: DeleteStitchLineParamsSchema) => void
  deletePocketOpening: (params: DeletePocketOpeningParamsSchema) => void
  deleteBinding: (params: DeleteBindingParamsSchema) => void
  deleteBindingField: (params: DeleteBindingFieldParamsSchema) => void
  deleteModelBindingFields: (params: DeleteModelBindingFieldsParamsSchema) => void
  setCornerRadiusBinding: (params: SetCornerRadiusBindingParamsSchema) => void
  setDefaultPocketOpening: (params: SetDefaultPocketOpeningParamsSchema) => void
  setStretchBinding: (params: SetStretchBindingParamsSchema) => void
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
    (project: ProjectSchema, subProject: SubProjectSchema): BaseSubProjectOperationParamsSchema => ({
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

  const executeOperation = useCallback(
    <Params>(operation: SubProjectOperationSchema<Params>, params: NoInfer<Params>): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = operation(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordChange(currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordChange, setSubProject],
  )

  const executeThrottledOperation = useCallback(
    <Params>(
      operation: SubProjectOperationSchema<Params>,
      params: NoInfer<Params>,
      throttleKey: SubProjectHistoryThrottleKeySchema,
    ): void => {
      const currentProject = ensureProject(project)
      const currentSubProject = ensureSubProject(subProject)
      const updated = operation(createBaseOperationParams(currentProject, currentSubProject), params)
      if (updated === currentSubProject) {
        return
      }
      recordThrottledUpdate(throttleKey, currentSubProject)
      setSubProject(updated)
    },
    [project, subProject, createBaseOperationParams, recordThrottledUpdate, setSubProject],
  )

  const addComponent = useCallback(
    (params: AddComponentParamsSchema): void => {
      executeOperation(addComponentPure, params)
    },
    [executeOperation],
  )

  const addComponents = useCallback(
    (params: AddComponentsParamsSchema): void => {
      executeOperation(addComponentsPure, params)
    },
    [executeOperation],
  )

  const addBinding = useCallback(
    (params: AddBindingParamsSchema): void => {
      executeOperation(addBindingPure, params)
    },
    [executeOperation],
  )

  const addBindings = useCallback(
    (params: AddBindingsParamsSchema): void => {
      executeOperation(addBindingsPure, params)
    },
    [executeOperation],
  )

  const addBindingFields = useCallback(
    (params: AddBindingFieldsParamsSchema): void => {
      executeOperation(addBindingFieldsPure, params)
    },
    [executeOperation],
  )

  const addHole = useCallback(
    (params: AddHoleParamsSchema): void => {
      executeOperation(addHolePure, params)
    },
    [executeOperation],
  )

  const addPocketOpening = useCallback(
    (params: AddPocketOpeningParamsSchema): void => {
      executeOperation(addPocketOpeningPure, params)
    },
    [executeOperation],
  )

  const addStitchLine = useCallback(
    (params: AddStitchLineParamsSchema): void => {
      executeOperation(addStitchLinePure, params)
    },
    [executeOperation],
  )

  const cloneComponent = useCallback(
    (params: CloneComponentParamsSchema): void => {
      executeOperation(cloneComponentPure, params)
    },
    [executeOperation],
  )

  const cloneHole = useCallback(
    (params: CloneHoleParamsSchema): void => {
      executeOperation(cloneHolePure, params)
    },
    [executeOperation],
  )

  const cloneStitchLine = useCallback(
    (params: CloneStitchLineParamsSchema): void => {
      executeOperation(cloneStitchLinePure, params)
    },
    [executeOperation],
  )

  const clonePocketOpening = useCallback(
    (params: ClonePocketOpeningParamsSchema): void => {
      executeOperation(clonePocketOpeningPure, params)
    },
    [executeOperation],
  )

  const deleteComponent = useCallback(
    (params: DeleteComponentParamsSchema): void => {
      executeOperation(deleteComponentPure, params)
    },
    [executeOperation],
  )

  const deleteHole = useCallback(
    (params: DeleteHoleParamsSchema): void => {
      executeOperation(deleteHolePure, params)
    },
    [executeOperation],
  )

  const deleteStitchLine = useCallback(
    (params: DeleteStitchLineParamsSchema): void => {
      executeOperation(deleteStitchLinePure, params)
    },
    [executeOperation],
  )

  const deletePocketOpening = useCallback(
    (params: DeletePocketOpeningParamsSchema): void => {
      executeOperation(deletePocketOpeningPure, params)
    },
    [executeOperation],
  )

  const deleteBinding = useCallback(
    (params: DeleteBindingParamsSchema): void => {
      executeOperation(deleteBindingPure, params)
    },
    [executeOperation],
  )

  const deleteBindingField = useCallback(
    (params: DeleteBindingFieldParamsSchema): void => {
      executeOperation(deleteBindingFieldPure, params)
    },
    [executeOperation],
  )

  const deleteModelBindingFields = useCallback(
    (params: DeleteModelBindingFieldsParamsSchema): void => {
      executeOperation(deleteModelBindingFieldsPure, params)
    },
    [executeOperation],
  )

  const setCornerRadiusBinding = useCallback(
    (params: SetCornerRadiusBindingParamsSchema): void => {
      executeOperation(setCornerRadiusBindingPure, params)
    },
    [executeOperation],
  )

  const setStretchBinding = useCallback(
    (params: SetStretchBindingParamsSchema): void => {
      executeOperation(setStretchBindingPure, params)
    },
    [executeOperation],
  )

  const attachPocketOpening = useCallback(
    (params: AttachPocketOpeningParamsSchema): void => {
      executeOperation(attachPocketOpeningPure, params)
    },
    [executeOperation],
  )

  const setDefaultPocketOpening = useCallback(
    (params: SetDefaultPocketOpeningParamsSchema): void => {
      executeOperation(setDefaultPocketOpeningPure, params)
    },
    [executeOperation],
  )

  const moveComponent = useCallback(
    (params: MoveComponentParamsSchema): void => {
      executeOperation(moveComponentPure, params)
    },
    [executeOperation],
  )

  const moveHole = useCallback(
    (params: MoveHoleParamsSchema): void => {
      executeOperation(moveHolePure, params)
    },
    [executeOperation],
  )

  const moveStitchLine = useCallback(
    (params: MoveStitchLineParamsSchema): void => {
      executeOperation(moveStitchLinePure, params)
    },
    [executeOperation],
  )

  const updateComponent = useCallback(
    (params: UpdateComponentParamsSchema): void => {
      executeThrottledOperation(updateComponentPure, params, `component:${params.component.id}`)
    },
    [executeThrottledOperation],
  )

  const updateHole = useCallback(
    (params: UpdateHoleParamsSchema): void => {
      executeThrottledOperation(updateHolePure, params, `hole:${params.hole.id}`)
    },
    [executeThrottledOperation],
  )

  const updateStitchLine = useCallback(
    (params: UpdateStitchLineParamsSchema): void => {
      executeThrottledOperation(updateStitchLinePure, params, `stitch-line:${params.stitchLine.id}`)
    },
    [executeThrottledOperation],
  )

  const updatePocketOpening = useCallback(
    (params: UpdatePocketOpeningParamsSchema): void => {
      executeThrottledOperation(updatePocketOpeningPure, params, `opening:${params.opening.id}`)
    },
    [executeThrottledOperation],
  )

  const flip = useCallback(
    (params: FlipParamsSchema): void => {
      executeOperation(flipPure, params)
    },
    [executeOperation],
  )

  return useMemo<UseSubProjectOperationsOutput>(
    () => ({
      addComponent,
      addComponents,
      addBinding,
      addBindings,
      addBindingFields,
      addHole,
      addPocketOpening,
      addStitchLine,
      attachPocketOpening,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
      clonePocketOpening,
      deleteComponent,
      deleteHole,
      deleteStitchLine,
      deletePocketOpening,
      deleteBinding,
      deleteBindingField,
      deleteModelBindingFields,
      setCornerRadiusBinding,
      setDefaultPocketOpening,
      setStretchBinding,
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
      addBinding,
      addBindings,
      addBindingFields,
      addHole,
      addPocketOpening,
      addStitchLine,
      attachPocketOpening,
      cloneComponent,
      cloneHole,
      cloneStitchLine,
      clonePocketOpening,
      deleteComponent,
      deleteHole,
      deleteStitchLine,
      deletePocketOpening,
      deleteBinding,
      deleteBindingField,
      deleteModelBindingFields,
      setCornerRadiusBinding,
      setDefaultPocketOpening,
      setStretchBinding,
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
