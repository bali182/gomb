import { Select, createListCollection, type ListCollection, type SelectValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { EditorSelect } from '../../common/EditorSelect'

import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketOrientationSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { PocketOpeningSideSchema, SlantedPocketOpeningSchema } from '../../../schemas/pocketOpening'
import { isDefined } from '../../../utils/isDefined'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type SlantedPocketOpeningFieldsProps = {
  modelId: string
  editable: EditableSchema<SlantedPocketOpeningSchema>
  issues: IssuesSchema<SlantedPocketOpeningSchema>
  orientation: PocketOrientationSchema
  onChange: (updated: EditableSchema<SlantedPocketOpeningSchema>) => void
}

const sides: PocketOpeningSideSchema[] = ['start', 'end']

export const SlantedPocketOpeningFields: FC<SlantedPocketOpeningFieldsProps> = ({
  modelId,
  editable,
  issues,
  orientation,
  onChange,
}) => {
  const { t } = useTranslation()
  const collection = useMemo<ListCollection<PocketOpeningSideSchema>>(
    () =>
      createListCollection<PocketOpeningSideSchema>({
        items: sides,
        itemToValue: (side) => side,
        itemToString: (side) => t.project.editors.enums.components.slantedPocketOpeningSide[orientation][side],
      }),
    [orientation, t],
  )
  const selectedValue = useMemo<string[]>(() => [editable.side], [editable.side])
  const handleOffsetChange = useCallback(
    (offset: string): void => {
      onChange({ ...editable, offset })
    },
    [editable, onChange],
  )
  const handleSideChange = useCallback(
    (details: SelectValueChangeDetails<PocketOpeningSideSchema>): void => {
      const side = details.items[0]
      if (isDefined(side)) {
        onChange({ ...editable, side })
      }
    },
    [editable, onChange],
  )

  return (
    <>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.slantedPocketOpening.side.tooltip}>
        {t.project.editors.sections.components.slantedPocketOpening.side.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.side}>
        <EditorSelect
          collection={collection}
          value={selectedValue}
          onValueChange={handleSideChange}
          positioning={{ strategy: 'fixed', sameWidth: true }}
          size="xs"
          width="full"
          minW="0"
          invalid={issues.side?.severity === 'error'}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content width="full">
              {collection.items.map((side) => (
                <Select.Item key={side} item={side}>
                  {t.project.editors.enums.components.slantedPocketOpeningSide[orientation][side]}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </EditorSelect>
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.slantedPocketOpening.offset.tooltip}>
        {t.project.editors.sections.components.slantedPocketOpening.offset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.offset}>
        <EditorNumberInput
          modelId={modelId}
          field="offset"
          value={editable.offset}
          issue={issues.offset}
          onChange={handleOffsetChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
    </>
  )
}
