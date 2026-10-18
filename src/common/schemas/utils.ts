/** Preserves model objects and arrays, replacing leaves with TValue and making object fields optional. */
export type OptionalModelFieldsSchema<T, TValue> = T extends readonly unknown[]
  ? { [K in keyof T]: OptionalModelFieldsSchema<Exclude<T[K], undefined>, TValue> }
  : T extends object
    ? { [K in keyof T]?: OptionalModelFieldsSchema<Exclude<T[K], undefined>, TValue> }
    : TValue

/** Makes nested model properties optional without replacing their values. */
export type DeepPartialSchema<T> = T extends readonly (infer Item)[]
  ? DeepPartialSchema<Item>[]
  : T extends object
    ? { [Property in keyof T]?: DeepPartialSchema<T[Property]> }
    : T

/** Selects numeric fields, including optional numeric fields. */
export type NumericFieldNameSchema<T> = T extends object
  ? Extract<{ [K in keyof T]-?: Exclude<T[K], undefined> extends number ? K : never }[keyof T], string>
  : never
