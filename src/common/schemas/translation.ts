export type DialogTranslationSchema = {
  title?: string
  description?: string
  positiveAction?: string
  negativeAction?: string
  errors?: Record<string, string>
  [key: string]: unknown
}

export type EmptyStateTranslationSchema = {
  title: string
  description?: string
  action?: string
  [key: string]: unknown
}

export type NativeDialogTranslationSchema = {
  title: string
  positiveAction: string
  extensionName?: string
}

export type EditorFieldTranslationSchema = {
  label?: string
  tooltip?: string
  placeholder?: string
}

export type CloneComponenActionTranslationSchema = {
  label: string
  tooltip: string
  headerTooltip: string
}

export type CloneComponentDialogSectionTranslationSchema<K extends string = string> = {
  title: string
  options: Record<K, CloneComponenActionTranslationSchema>
}

export type EditorFieldTranslations<T extends string> = Record<T, EditorFieldTranslationSchema>

export type SectionTranslationSchema<T> = { title: string } & EditorFieldTranslations<Extract<keyof T, string>> &
  Record<string, EditorFieldTranslationSchema | string>

export type EnumTranslationSchema<T extends string | boolean> = [T] extends [boolean]
  ? Record<'true' | 'false', string>
  : Record<Extract<T, string>, string>
