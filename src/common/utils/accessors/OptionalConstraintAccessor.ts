import type {
  ComponentAccessorSchema,
  ConstraintAccessorSchema,
  HoleAccessorSchema,
  OptionalAccessorSchema,
  PocketOpeningAccessorSchema,
  StitchLineAccessorSchema,
} from '../../schemas/accessors'
import type { ConstraintFieldNameSchema, ConstraintFieldSchema, ConstraintSchema } from '../../schemas/constraints'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'

export class OptionalConstraintAccessor implements OptionalAccessorSchema<ConstraintAccessorSchema> {
  private readonly constraintsByModel = new Map<string, ConstraintSchema[]>()
  private readonly constraintsByField = new Map<string, Map<ConstraintFieldNameSchema, ConstraintSchema[]>>()

  constructor(
    private readonly root: SubProjectSchema,
    private readonly component: OptionalAccessorSchema<ComponentAccessorSchema>,
    private readonly hole: OptionalAccessorSchema<HoleAccessorSchema>,
    private readonly stitchLine: OptionalAccessorSchema<StitchLineAccessorSchema>,
    private readonly pocketOpening: OptionalAccessorSchema<PocketOpeningAccessorSchema>,
  ) {
    for (const constraint of Object.values(root.constraints)) {
      for (const field of constraint.fields) {
        const byModel = this.constraintsByModel.get(field.modelId) ?? []
        if (!byModel.includes(constraint)) {
          byModel.push(constraint)
        }
        this.constraintsByModel.set(field.modelId, byModel)
        const byField =
          this.constraintsByField.get(field.modelId) ?? new Map<ConstraintFieldNameSchema, ConstraintSchema[]>()
        const constraints = byField.get(field.field) ?? []
        if (!constraints.includes(constraint)) {
          constraints.push(constraint)
        }
        byField.set(field.field, constraints)
        this.constraintsByField.set(field.modelId, byField)
      }
    }
    this.byId = this.byId.bind(this)
    this.byModel = this.byModel.bind(this)
    this.byField = this.byField.bind(this)
    this.model = this.model.bind(this)
  }

  byId(id: string): ConstraintSchema | undefined {
    return Object.prototype.hasOwnProperty.call(this.root.constraints, id) ? this.root.constraints[id] : undefined
  }

  byModel(modelId: string): ConstraintSchema[] {
    return this.constraintsByModel.get(modelId) ?? []
  }

  byField(modelId: string, field: ConstraintFieldNameSchema): ConstraintSchema[] {
    return this.constraintsByField.get(modelId)?.get(field) ?? []
  }

  model(field: ConstraintFieldSchema): ModelObjectSchema | undefined {
    switch (field.type) {
      case 'root-panel-constraint-field':
        return this.component.rootPanel(field.modelId)
      case 'panel-constraint-field':
        return this.component.panel(field.modelId)
      case 'pocket-cluster-constraint-field':
        return this.component.pocketCluster(field.modelId)
      case 'front-pocket-constraint-field':
        return this.component.frontPocket(field.modelId)
      case 't-pocket-constraint-field':
        return this.component.tPocket(field.modelId)
      case 'hole-constraint-field':
        return this.hole.byId(field.modelId)
      case 'component-bounds-stitch-line-constraint-field':
        return this.stitchLine.bounds(field.modelId)
      case 't-pocket-stitch-line-constraint-field':
        return this.stitchLine.tPocket(field.modelId)
      case 'recessed-constraint-field':
      case 'slanted-constraint-field':
      case 'optical-illusion-constraint-field': {
        return this.pocketOpening.byId(field.modelId)
      }
    }
  }
}
