import type { AccessorOwnerSchema, ConstraintAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { BindingFieldNameSchema, BindingFieldSchema, BindingSchema } from '../../schemas/constraints'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class ConstraintAccessor extends BaseStrictAccessor implements ConstraintAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<ConstraintAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
    this.byModel = this.byModel.bind(this)
    this.byField = this.byField.bind(this)
    this.model = this.model.bind(this)
  }
  byId(id: string): BindingSchema {
    return this.requireResult(this.optional.byId(id), 'constraint')
  }
  byModel(modelId: string): BindingSchema[] {
    return this.optional.byModel(modelId)
  }
  byField(modelId: string, field: BindingFieldNameSchema): BindingSchema[] {
    return this.optional.byField(modelId, field)
  }
  model(field: BindingFieldSchema): ModelObjectSchema {
    return this.requireResult(this.optional.model(field), 'constraint field model')
  }
  constraints(): readonly BindingSchema[] {
    return this.optional.constraints()
  }
}
