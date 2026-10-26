/** Settings selected for copying to one target pocket. */
export type PocketSettingsCopySelectionSchema = {
  copyShape: boolean
  copyOpening: boolean
  copyPocketItem: boolean
  copyStitching: boolean
  overwriteStitching: boolean
}

/** Target pocket IDs mapped to their copy selections. Excludes the source pocket. */
export type PocketSettingsCopyTargetsSchema = Record<string, PocketSettingsCopySelectionSchema>

/** Derived state of a checkbox in the pocket copy grid. */
export type PocketSettingsCopyCellSchema = {
  checked: boolean | 'indeterminate'
  disabled: boolean
}

/** Derived cells for one pocket, including the read-only source row. */
export type PocketSettingsCopyRowSchema = {
  pocketId: string
  copyShape: PocketSettingsCopyCellSchema
  copyOpening: PocketSettingsCopyCellSchema
  copyPocketItem: PocketSettingsCopyCellSchema
  copyStitching: PocketSettingsCopyCellSchema
  overwriteStitching: PocketSettingsCopyCellSchema
}
