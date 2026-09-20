export type DialogTranslationSchema = {
  title?: string
  description?: string
  positiveAction?: string
  negativeAction?: string
  errors?: Record<string, string>
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

export type EditorFieldTranslations<T extends string> = Record<T, EditorFieldTranslationSchema>

export type SectionTranslationSchema<T> = { title: string } & EditorFieldTranslations<Extract<keyof T, string>> &
  Record<string, EditorFieldTranslationSchema | string>

export type EnumTranslationSchema<T extends string | boolean> = [T] extends [boolean]
  ? Record<'true' | 'false', string>
  : Record<Extract<T, string>, string>
