import { SegmentGroup } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'
import { PiArrowsHorizontal, PiArrowsVertical, PiColumns, PiRows, PiRuler } from 'react-icons/pi'

import { useTranslation } from '../../../hooks/useTranslation'
import type { HasLayoutSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { AutoDimensionEditor } from '../../common/AutoDimensionEditor'
import { SectionGroup } from '../../common/SectionGroup'

type LayoutSectionProps<T> = {
  component: T
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function LayoutSection<T extends HasLayoutSchema>({
  editable,
  issues,
  onChange,
}: LayoutSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const handleOrientationChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails) => {
      onChange({ ...editable, layoutOrientation: details.value })
    },
    [editable, onChange],
  )

  const handleGapChange = useCallback(
    (layoutGap: string) => {
      onChange({ ...editable, layoutGap })
    },
    [editable, onChange],
  )

  const handleAutoLayoutGapChange = useCallback(
    (autoLayoutGap: boolean) => {
      onChange({ ...editable, autoLayoutGap })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.components.layout.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.components.layout.layoutOrientation.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.layoutOrientation}>
        <SegmentGroup.Root onValueChange={handleOrientationChange} size="sm" value={editable.layoutOrientation}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="horizontal">
            <SegmentGroup.ItemHiddenInput />
            <PiColumns /> {t.project.editors.enums.components.layoutOrientation.horizontal}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="vertical">
            <SegmentGroup.ItemHiddenInput />
            <PiRows /> {t.project.editors.enums.components.layoutOrientation.vertical}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.components.layout.layoutGap.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.layoutGap}>
        <AutoDimensionEditor
          auto={editable.autoLayoutGap}
          autoIcon={editable.layoutOrientation === 'horizontal' ? PiArrowsHorizontal : PiArrowsVertical}
          placeholder={t.project.editors.sections.components.layout.layoutGap.placeholder}
          issue={issues.layoutGap}
          manualIcon={PiRuler}
          onAutoChange={handleAutoLayoutGapChange}
          onValueChange={handleGapChange}
          unit="mm"
          value={editable.layoutGap}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
