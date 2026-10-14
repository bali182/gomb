import { SegmentGroup } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'

import { defaultRecessedPocketTop } from '../../../defaultStates'
import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketTopSchema, RecessedPocketTopSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { getEditableSchema } from '../../../utils/getEditableSchema'
import { SectionGroup } from '../../common/SectionGroup'
import { RecessedPocketTopFields } from './RecessedPocketTopFields'

type PocketTopSectionProps = {
  editable: EditableSchema<PocketTopSchema>
  issues: ValidationIssuesSchema<PocketTopSchema>
  onChange: (updated: EditableSchema<PocketTopSchema>) => void
}

export const PocketTopSection: FC<PocketTopSectionProps> = ({ editable, issues, onChange }) => {
  const { t, language } = useTranslation()
  const text = t.project.editors.sections.components.pocketTop
  const handleTypeChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      switch (details.value) {
        case 'straight':
          onChange({ type: 'straight' })
          break
        case 'recessed':
          onChange(getEditableSchema(defaultRecessedPocketTop, { language }))
          break
      }
    },
    [language, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{text.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={text.type.tooltip}>{text.type.label}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.type}>
        <SegmentGroup.Root value={editable.type} onValueChange={handleTypeChange} size="sm">
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="straight">
            <SegmentGroup.ItemHiddenInput />
            {t.project.editors.enums.components.pocketTop.straight}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="recessed">
            <SegmentGroup.ItemHiddenInput />
            {t.project.editors.enums.components.pocketTop.recessed}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>
      <PocketTopFields editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Section>
  )
}

const PocketTopFields: FC<PocketTopSectionProps> = ({ editable, issues, onChange }) => {
  switch (editable.type) {
    case 'straight':
      return null
    case 'recessed':
      return (
        <RecessedPocketTopFields
          editable={editable}
          issues={issues as ValidationIssuesSchema<RecessedPocketTopSchema>}
          onChange={onChange}
        />
      )
  }
}
