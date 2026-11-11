import { FlipAxisSchema } from './common'
import { ComponentSchema } from './components'
import { ConstraintSchema } from './constraints'
import { ConstraintFieldInputSchema, ModelObjectFactorySchema, ReadonlyModelObjectFactorySchema } from './factory'
import { HoleSchema } from './hole'
import { IdGeneratorSchema, NameGeneratorSchema } from './idGenerator'
import { ModelObjectSchema } from './modelObject'
import { PocketOpeningSchema } from './pocketOpening'
import { ProjectSchema } from './project'
import { GlobalSettingsSchema } from './settings'
import { StitchLineSchema } from './stitching'
import { SubProjectSchema } from './subProject'

export type SubProjectOperationSchema<Params> = (
  base: BaseSubProjectOperationParamsSchema,
  params: Params,
) => SubProjectSchema

export type BaseSubProjectOperationParamsSchema = {
  project: ProjectSchema
  subProject: SubProjectSchema
  settings: GlobalSettingsSchema
  id: IdGeneratorSchema
  name: NameGeneratorSchema
  factory: ModelObjectFactorySchema
  readonlyFactory: ReadonlyModelObjectFactorySchema
}

export type ComponentInsertionPositionSchema = 'start' | 'end' | number

export type AddComponentParamsSchema = {
  type: ComponentSchema['type']
  color?: string
  parentId: string
  position: ComponentInsertionPositionSchema
}

export type CreateComponentsFnParamsSchema = {
  factory: ModelObjectFactorySchema
  forbiddenIds: Set<string>
  forbiddenNames: Set<string>
}

export type AddComponentsParamsSchema = {
  /**
   * Produce all components using the model object factory.
   * It's the responsibility of the provider of this function to keep track of names (pass in names/ids to factory functions).
   */
  createComponents: (params: CreateComponentsFnParamsSchema) => ComponentSchema[]
  parentId: string
  position: ComponentInsertionPositionSchema
}

export type AddConstraintParamsSchema = {
  type: ConstraintSchema['type']
}

export type AddConstraintFieldsParamsSchema = {
  constraintId: string
  fields: ConstraintFieldInputSchema[]
}

export type AddHoleParamsSchema = {
  targetId: string
}

export type AddPocketOpeningParamsSchema = {
  type: PocketOpeningSchema['type']
}

export type AddStitchLineToHoleParamsSchema = {
  targetType: 'hole'
  targetId: string
}

export type AddStitchLineToComponentParamsSchema = {
  targetType: 'component'
  targetId: string
  type: StitchLineSchema['type']
}

export type AddStitchLineParamsSchema = AddStitchLineToHoleParamsSchema | AddStitchLineToComponentParamsSchema

export type CloneRelatedModelActionSchema = 'clone' | 'ignore'
export type CloneRelatedConstraintActionSchema = 'constrain-separately' | 'add-to-existing' | 'ignore'
export type ClonePocketOpeningActionSchema = 'keep-original' | 'clone' | 'set-to-default'

export type CloneRelatedModelSchema = {
  action: CloneRelatedModelActionSchema
}

export type CloneRelatedConstraintSchema = {
  action: CloneRelatedConstraintActionSchema
}

export type CloneRelatedPocketOpeningSchema = {
  action: ClonePocketOpeningActionSchema
}

export type CloneComponentParamsSchema = {
  rootId: string
  children: Record<string, CloneRelatedModelSchema>
  holes: Record<string, CloneRelatedModelSchema>
  stitchLines: Record<string, CloneRelatedModelSchema>
  pocketOpenings: Record<string, CloneRelatedPocketOpeningSchema>
  constraints: Record<string, CloneRelatedConstraintSchema>
}

export type CloneHoleParamsSchema = {
  id: string
}

export type CloneStitchLineParamsSchema = {
  id: string
}

export type ClonePocketOpeningParamsSchema = {
  id: string
}

export type DeleteComponentParamsSchema = {
  id: string
}

export type DeleteHoleParamsSchema = {
  id: string
}

export type DeleteStitchLineParamsSchema = {
  id: string
}

export type DeletePocketOpeningParamsSchema = {
  id: string
}

export type DeleteConstraintParamsSchema = {
  id: string
}

export type DeleteConstraintFieldParamsSchema = {
  constraintId: string
  id: string
}

export type SetDefaultPocketOpeningParamsSchema = {
  id: string
}

export type MoveComponentParamsSchema = {
  id: string
  targetParentId: string
  beforeComponentId: string | undefined
}

export type MoveHoleParamsSchema = {
  id: string
  targetComponentId: string
}

export type MoveStitchLineToHoleParamsSchema = {
  id: string
  targetType: 'hole'
  targetId: string
}

export type MoveStitchLineToComponentParamsSchema = {
  id: string
  targetType: 'component'
  targetId: string
}

export type MoveStitchLineParamsSchema = MoveStitchLineToHoleParamsSchema | MoveStitchLineToComponentParamsSchema

export type UpdateComponentParamsSchema = {
  component: ComponentSchema
}

export type UpdateHoleParamsSchema = {
  hole: HoleSchema
}

export type UpdateStitchLineParamsSchema = {
  stitchLine: StitchLineSchema
}

export type UpdatePocketOpeningParamsSchema = {
  opening: PocketOpeningSchema
}

export type FlipParamsSchema = {
  model: ModelObjectSchema
  axis: FlipAxisSchema
}
