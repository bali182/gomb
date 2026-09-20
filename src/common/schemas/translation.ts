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
  label?: string
  tooltip?: string
  placeholder?: string
}
