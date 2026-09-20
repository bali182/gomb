import { HasTypeSchema } from './common'
import { BaseComponentSchema, HasChildrenSchema, PanelSchema, PocketClusterSchema, RootPanelSchema } from './components'

export type DialogTranslationSchema = {
  title: string
  description?: string
  positiveAction: string
  negativeAction?: string
}

export type NativeDialogTranslationSchema = {
  title: string
  positiveAction: string
  extensionName?: string
}

export type EditorFieldTranslationSchema = {
  label: string
  tooltip?: string
  placeholder?: string
}

type EditableFieldsSchema<T> = Exclude<keyof T, keyof (HasTypeSchema<string> & BaseComponentSchema & HasChildrenSchema)>

export type RootPanelFieldsTranslationSchema = Record<
  EditableFieldsSchema<RootPanelSchema>,
  EditorFieldTranslationSchema
>

export type PanelFieldsTranslationSchema = Record<EditableFieldsSchema<PanelSchema>, EditorFieldTranslationSchema>

export type PocketClusterFieldsTranslationSchema = Record<
  EditableFieldsSchema<PocketClusterSchema>,
  EditorFieldTranslationSchema
>
