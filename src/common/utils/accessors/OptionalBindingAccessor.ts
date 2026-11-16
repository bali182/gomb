import type {
  BindingAccessorSchema,
  ComponentAccessorSchema,
  HoleAccessorSchema,
  OptionalAccessorSchema,
  PocketOpeningAccessorSchema,
  StitchLineAccessorSchema,
} from '../../schemas/accessors'
import type {
  BindingFieldNameSchema,
  BindingFieldSchema,
  BindingSchema,
  EqualBindingSchema,
} from '../../schemas/bindings'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import { has } from '../has'
import { isDefined } from '../isDefined'
import { narrowers } from '../narrowers'

export class OptionalBindingAccessor implements OptionalAccessorSchema<BindingAccessorSchema> {
  private readonly bindingsByModel = new Map<string, BindingSchema[]>()
  private readonly bindingsByField = new Map<string, Map<BindingFieldNameSchema, BindingSchema[]>>()
  private readonly allBindings: BindingSchema[]

  constructor(
    private readonly root: SubProjectSchema,
    private readonly component: OptionalAccessorSchema<ComponentAccessorSchema>,
    private readonly hole: OptionalAccessorSchema<HoleAccessorSchema>,
    private readonly stitchLine: OptionalAccessorSchema<StitchLineAccessorSchema>,
    private readonly pocketOpening: OptionalAccessorSchema<PocketOpeningAccessorSchema>,
  ) {
    this.allBindings = Object.values(root.bindings)
    for (const binding of this.allBindings) {
      for (const field of binding.fields) {
        const byModel = this.bindingsByModel.get(field.modelId) ?? []
        if (!byModel.includes(binding)) {
          byModel.push(binding)
        }
        this.bindingsByModel.set(field.modelId, byModel)
        const byField = this.bindingsByField.get(field.modelId) ?? new Map<BindingFieldNameSchema, BindingSchema[]>()
        const bindings = byField.get(field.field) ?? []
        if (!bindings.includes(binding)) {
          bindings.push(binding)
        }
        byField.set(field.field, bindings)
        this.bindingsByField.set(field.modelId, byField)
      }
    }
    this.byId = this.byId.bind(this)
    this.byModel = this.byModel.bind(this)
    this.byField = this.byField.bind(this)
    this.model = this.model.bind(this)
  }

  byId(id: string): BindingSchema | undefined {
    return has(this.root.bindings, id) ? this.root.bindings[id] : undefined
  }

  byModel(modelId: string): BindingSchema[] {
    return this.bindingsByModel.get(modelId) ?? []
  }

  byField(modelId: string, field: BindingFieldNameSchema): BindingSchema[] {
    return this.bindingsByField.get(modelId)?.get(field) ?? []
  }

  model(field: BindingFieldSchema): ModelObjectSchema | undefined {
    switch (field.type) {
      case 'root-panel-binding-field':
        return this.component.rootPanel(field.modelId)
      case 'panel-binding-field':
        return this.component.panel(field.modelId)
      case 'pocket-cluster-binding-field':
        return this.component.pocketCluster(field.modelId)
      case 'front-pocket-binding-field':
        return this.component.frontPocket(field.modelId)
      case 't-pocket-binding-field':
        return this.component.tPocket(field.modelId)
      case 'hole-binding-field':
        return this.hole.byId(field.modelId)
      case 'component-bounds-stitch-line-binding-field':
        return this.stitchLine.bounds(field.modelId)
      case 't-pocket-stitch-line-binding-field':
        return this.stitchLine.tPocket(field.modelId)
      case 'recessed-binding-field': {
        const opening = this.pocketOpening.byId(field.modelId)
        return isDefined(opening) && narrowers.is.recessedPocketOpening(opening) ? opening : undefined
      }
      case 'slanted-binding-field': {
        const opening = this.pocketOpening.byId(field.modelId)
        return isDefined(opening) && narrowers.is.slantedPocketOpening(opening) ? opening : undefined
      }
      case 'optical-illusion-binding-field': {
        const opening = this.pocketOpening.byId(field.modelId)
        return isDefined(opening) && narrowers.is.opticalIllusionPocketOpening(opening) ? opening : undefined
      }
    }
  }

  bindings(): readonly EqualBindingSchema[] {
    return this.allBindings
  }
}
