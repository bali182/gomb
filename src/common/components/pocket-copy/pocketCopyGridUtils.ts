import type {
  PocketSettingsCopyCellSchema,
  PocketSettingsCopyRowSchema,
  PocketSettingsCopySelectionSchema,
  PocketSettingsCopyTargetsSchema,
} from '../../schemas/pocketCopy'

export const pocketCopyColumns: readonly (keyof PocketSettingsCopySelectionSchema)[] = [
  'copyShape',
  'copyOpening',
  'copyStitching',
  'overwriteStitching',
]
export const pocketCopyRowColumns = pocketCopyColumns.filter((column) => column !== 'overwriteStitching')

export const getHeaderCell = (
  rows: PocketSettingsCopyRowSchema[],
  column: keyof PocketSettingsCopySelectionSchema,
): PocketSettingsCopyCellSchema => {
  return getGroupCell(rows.map((row) => row[column]))
}

export const getRowCell = (row: PocketSettingsCopyRowSchema, isSource: boolean): PocketSettingsCopyCellSchema => {
  if (isSource) {
    return { checked: true, disabled: true }
  }
  return getGroupCell(pocketCopyRowColumns.map((column) => row[column]))
}

export const getTargets = (
  rows: PocketSettingsCopyRowSchema[],
  sourcePocketId: string,
  targets: Partial<PocketSettingsCopyTargetsSchema>,
): PocketSettingsCopyTargetsSchema => {
  return Object.fromEntries(
    rows
      .filter((row) => row.pocketId !== sourcePocketId)
      .map((row) => [
        row.pocketId,
        {
          copyShape: targets[row.pocketId]?.copyShape ?? false,
          copyOpening: targets[row.pocketId]?.copyOpening ?? false,
          copyStitching: targets[row.pocketId]?.copyStitching ?? false,
          overwriteStitching: targets[row.pocketId]?.overwriteStitching ?? true,
        } satisfies PocketSettingsCopySelectionSchema,
      ]),
  )
}

export const getGroupCell = (cells: PocketSettingsCopyCellSchema[]): PocketSettingsCopyCellSchema => {
  const enabledCells = cells.filter((cell) => !cell.disabled)
  if (enabledCells.length === 0) {
    return { checked: false, disabled: true }
  }
  if (enabledCells.every((cell) => cell.checked === true)) {
    return { checked: true, disabled: false }
  }
  if (enabledCells.some((cell) => cell.checked !== false)) {
    return { checked: 'indeterminate', disabled: false }
  }
  return { checked: false, disabled: false }
}
