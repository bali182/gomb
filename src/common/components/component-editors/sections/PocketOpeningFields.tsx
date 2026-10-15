import {
  Input,
  Select,
  createListCollection,
  type ListCollection,
  type SelectValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'

import { defaultRecessedPocketOpening } from '../../../defaultStates'
import { useTranslation } from '../../../hooks/useTranslation'
import type { HasIdentitySchema } from '../../../schemas/common'
import type {
  PocketOpeningOwnSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
} from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { getEditableSchema } from '../../../utils/getEditableSchema'
import { SectionGroup } from '../../common/SectionGroup'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'

type PocketOpeningFieldsProps = {
  editable: EditableSchema<PocketOpeningSchema>
  issues: ValidationIssuesSchema<PocketOpeningSchema>
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
}

export const PocketOpeningFields: FC<PocketOpeningFieldsProps> = ({ editable, issues, onChange }) => {
  const { t, language } = useTranslation()

  const collection = useMemo<ListCollection<PocketOpeningOwnSchema['type']>>(
    () =>
      createListCollection<PocketOpeningOwnSchema['type']>({
        items: ['straight', 'recessed'],
        itemToString: (type) => t.project.editors.enums.components.pocketOpening[type],
        itemToValue: (type) => type,
      }),
    [t],
  )

  const selectedType = useMemo<string[]>(() => [editable.type], [editable.type])

  const handleTypeChange = useCallback(
    (details: SelectValueChangeDetails<PocketOpeningOwnSchema['type']>): void => {
      const identity: HasIdentitySchema = { id: editable.id, name: editable.name }
      switch (details.items[0]) {
        case 'straight':
          onChange({ ...identity, type: 'straight' })
          break
        case 'recessed':
          onChange({ ...getEditableSchema(defaultRecessedPocketOpening, { language }), ...identity })
          break
      }
    },
    [editable.id, editable.name, language, onChange],
  )

  return (
    <SectionGroup.Root>
      <SectionGroup.Section>
        <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pocketOpening.name.tooltip}>
          {t.project.editors.sections.components.pocketOpening.name.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.name}>
          <Input
            size="xs"
            value={editable.name}
            aria-invalid={issues.name?.severity === 'error'}
            onChange={(event) => onChange({ ...editable, name: event.currentTarget.value })}
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pocketOpening.type.tooltip}>
          {t.project.editors.sections.components.pocketOpening.type.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.type}>
          <Select.Root
            collection={collection}
            value={selectedType}
            onValueChange={handleTypeChange}
            positioning={{ strategy: 'fixed' }}
            size="xs"
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
              <Select.Content>
                {collection.items.map((type) => (
                  <Select.Item key={type} item={type}>
                    {t.project.editors.enums.components.pocketOpening[type]}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </SectionGroup.SectionRowEditor>
        <PocketOpeningShapeFields editable={editable} issues={issues} onChange={onChange} />
      </SectionGroup.Section>
    </SectionGroup.Root>
  )
}

const PocketOpeningShapeFields: FC<PocketOpeningFieldsProps> = ({ editable, issues, onChange }) => {
  switch (editable.type) {
    case 'straight':
      return undefined
    case 'recessed':
      return (
        <RecessedPocketOpeningFields
          editable={editable}
          issues={issues as ValidationIssuesSchema<RecessedPocketOpeningSchema>}
          onChange={(updated: EditableSchema<RecessedPocketOpeningSchema>): void =>
            onChange({ ...updated, id: editable.id, name: editable.name })
          }
        />
      )
  }
}
