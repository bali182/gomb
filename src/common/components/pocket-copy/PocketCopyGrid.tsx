import { Checkbox, Icon, Table, Text } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiInfo } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import type {
  PocketSettingsCopyCellSchema,
  PocketSettingsCopyRowSchema,
  PocketSettingsCopySelectionSchema,
  PocketSettingsCopyTargetsSchema,
} from '../../schemas/pocketCopy'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { Tooltip } from '../common/Tooltip'
import { getPocketSettingsCopyRows } from './getPocketSettingsCopyRows'
import { getGroupCell, getHeaderCell, getRowCell, getTargets, pocketCopyColumns, pocketCopyRowColumns } from './pocketCopyGridUtils'

export type PocketCopyGridProps = {
  subProject: SubProjectSchema
  sourcePocketId: string
  targets: Partial<PocketSettingsCopyTargetsSchema>
  onChange: (targets: PocketSettingsCopyTargetsSchema) => void
}

export const PocketCopyGrid: FC<PocketCopyGridProps> = ({ subProject, sourcePocketId, targets, onChange }) => {
  const { t } = useTranslation()
  const rows = useMemo<PocketSettingsCopyRowSchema[]>(
    () => getPocketSettingsCopyRows(subProject, sourcePocketId, targets),
    [subProject, sourcePocketId, targets],
  )
  const headerCells = useMemo<Record<keyof PocketSettingsCopySelectionSchema, PocketSettingsCopyCellSchema>>(
    () => ({
      copyShape: getHeaderCell(rows, 'copyShape'),
      copyOpening: getHeaderCell(rows, 'copyOpening'),
      copyStitching: getHeaderCell(rows, 'copyStitching'),
      overwriteStitching: getHeaderCell(rows, 'overwriteStitching'),
    }),
    [rows],
  )
  const allCell = useMemo<PocketSettingsCopyCellSchema>(
    () => getGroupCell(pocketCopyColumns.map((column) => headerCells[column])),
    [headerCells],
  )

  const handleAllClick = useCallback((): void => {
    if (allCell.disabled) {
      return
    }
    const checked = allCell.checked !== true
    const updatedTargets = getTargets(rows, sourcePocketId, targets)
    for (const row of rows) {
      const enabledColumns = pocketCopyRowColumns.filter((column) => !row[column].disabled)
      if (enabledColumns.length === 0) {
        continue
      }
      for (const column of enabledColumns) {
        updatedTargets[row.pocketId][column] = checked
      }
      if (checked) {
        updatedTargets[row.pocketId].overwriteStitching = true
      }
    }
    onChange(updatedTargets)
  }, [allCell, onChange, rows, sourcePocketId, targets])

  const handleCellClick = useCallback(
    (row: PocketSettingsCopyRowSchema, column: keyof PocketSettingsCopySelectionSchema): void => {
      if (row[column].disabled) {
        return
      }
      const updatedTargets = getTargets(rows, sourcePocketId, targets)
      updatedTargets[row.pocketId][column] = row[column].checked !== true
      onChange(updatedTargets)
    },
    [onChange, rows, sourcePocketId, targets],
  )

  const handleRowClick = useCallback(
    (row: PocketSettingsCopyRowSchema): void => {
      const enabledColumns = pocketCopyRowColumns.filter((column) => !row[column].disabled)
      if (enabledColumns.length === 0) {
        return
      }
      const checked = !enabledColumns.every((column) => row[column].checked === true)
      const updatedTargets = getTargets(rows, sourcePocketId, targets)
      for (const column of enabledColumns) {
        updatedTargets[row.pocketId][column] = checked
      }
      onChange(updatedTargets)
    },
    [onChange, rows, sourcePocketId, targets],
  )

  const handleColumnClick = useCallback(
    (column: keyof PocketSettingsCopySelectionSchema): void => {
      if (headerCells[column].disabled) {
        return
      }
      const checked = headerCells[column].checked !== true
      const updatedTargets = getTargets(rows, sourcePocketId, targets)
      for (const row of rows) {
        if (row[column].disabled) {
          continue
        }
        updatedTargets[row.pocketId][column] = checked
      }
      onChange(updatedTargets)
    },
    [headerCells, onChange, rows, sourcePocketId, targets],
  )

  return (
    <Table.ScrollArea p="1px">
      <Table.Root size="sm" variant="outline" showColumnBorder tableLayout="fixed" width="100%">
        <Table.Header bg="bg.muted">
          <Table.Row>
            <Tooltip content={t.dialogs.pocketCopy.selectAll.tooltip}>
              <Table.ColumnHeader
                textAlign="center"
                verticalAlign="middle"
                cursor={allCell.disabled ? 'not-allowed' : 'pointer'}
                onClick={handleAllClick}
              >
                <Checkbox.Root
                  checked={allCell.checked}
                  disabled={allCell.disabled}
                  readOnly
                  pointerEvents="none"
                  verticalAlign="middle"
                  gap="2"
                  size="sm"
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label display="flex" alignItems="center" gap="1" whiteSpace="nowrap">
                    {t.dialogs.pocketCopy.selectAll.label}
                    <Icon as={PiInfo} color="fg.muted" flexShrink="0" size="sm" />
                  </Checkbox.Label>
                </Checkbox.Root>
              </Table.ColumnHeader>
            </Tooltip>
            {pocketCopyColumns.map((column) => (
              <Tooltip key={column} content={t.dialogs.pocketCopy.columns[column].tooltip}>
                <Table.ColumnHeader
                  textAlign="center"
                  verticalAlign="middle"
                  cursor={headerCells[column].disabled ? 'not-allowed' : 'pointer'}
                  onClick={() => handleColumnClick(column)}
                >
                  <Checkbox.Root
                    checked={headerCells[column].checked}
                    disabled={headerCells[column].disabled}
                    readOnly
                    pointerEvents="none"
                    verticalAlign="middle"
                    gap="2"
                    size="sm"
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label display="flex" alignItems="center" gap="1" whiteSpace="nowrap">
                      {t.dialogs.pocketCopy.columns[column].label}
                      <Icon as={PiInfo} color="fg.muted" flexShrink="0" size="sm" />
                    </Checkbox.Label>
                  </Checkbox.Root>
                </Table.ColumnHeader>
              </Tooltip>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const pocket = accessors.subProject(subProject).pocket(row.pocketId)
            const isSource = row.pocketId === sourcePocketId
            const rowCell = getRowCell(row, isSource)
            return (
              <Table.Row key={row.pocketId} onClick={() => handleRowClick(row)}>
                <Table.Cell
                  verticalAlign="middle"
                  py={isSource ? '0' : undefined}
                  bg={rowCell.disabled ? 'bg.subtle' : undefined}
                  cursor={rowCell.disabled ? 'not-allowed' : 'pointer'}
                  _hover={rowCell.disabled ? undefined : { bg: 'bg.muted' }}
                >
                  <Checkbox.Root
                    checked={rowCell.checked}
                    disabled={rowCell.disabled}
                    readOnly
                    pointerEvents="none"
                    verticalAlign="middle"
                    gap="2"
                    size="sm"
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label display="flex" flexDirection="column" lineHeight="short">
                      {pocket.name}
                      {isSource && (
                        <Text as="span" textStyle="xs" lineHeight="1" color="fg.muted">
                          {t.dialogs.pocketCopy.sourceHint}
                        </Text>
                      )}
                    </Checkbox.Label>
                  </Checkbox.Root>
                </Table.Cell>
                {pocketCopyColumns.map((column) => (
                  <Table.Cell
                    key={column}
                    textAlign="center"
                    verticalAlign="middle"
                    bg={row[column].disabled ? 'bg.subtle' : undefined}
                    cursor={row[column].disabled ? 'not-allowed' : 'pointer'}
                    _hover={row[column].disabled ? undefined : { bg: 'bg.muted' }}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleCellClick(row, column)
                    }}
                  >
                    <Checkbox.Root
                      checked={row[column].checked}
                      disabled={row[column].disabled}
                      readOnly
                      pointerEvents="none"
                      verticalAlign="middle"
                      size="sm"
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Root>
                  </Table.Cell>
                ))}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
