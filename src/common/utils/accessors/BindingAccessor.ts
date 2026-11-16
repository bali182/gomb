import type { AccessorOwnerSchema, BindingAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { BindingFieldNameSchema, BindingFieldSchema, BindingSchema } from '../../schemas/bindings'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class BindingAccessor extends BaseStrictAccessor implements BindingAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<BindingAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
    this.byModel = this.byModel.bind(this)
    this.byField = this.byField.bind(this)
    this.model = this.model.bind(this)
  }
  byId(id: string): BindingSchema {
    return this.requireResult(this.optional.byId(id), 'binding')
  }
  byModel(modelId: string): BindingSchema[] {
    return this.optional.byModel(modelId)
  }
  byField(modelId: string, field: BindingFieldNameSchema): BindingSchema[] {
    return this.optional.byField(modelId, field)
  }
  model(field: BindingFieldSchema): ModelObjectSchema {
    return this.requireResult(this.optional.model(field), 'binding field model')
  }
  bindings(): readonly BindingSchema[] {
    return this.optional.bindings()
  }
}
