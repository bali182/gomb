import { SegmentGroup } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'
import {
  PiAlignBottomSimple,
  PiAlignCenterHorizontalSimple,
  PiAlignCenterVerticalSimple,
  PiAlignLeftSimple,
  PiAlignRightSimple,
  PiAlignTopSimple,
} from 'react-icons/pi'

import { useTranslation } from '../../../hooks/useTranslation'
import type { AnchorSchema, HasXYOffsetSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { HasAnchorsSchema } from '../../../schemas/hole'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type HolePositionSectionProps<T> = {
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function HolePositionSection<T extends HasAnchorsSchema & HasXYOffsetSchema>({
  editable,
  issues,
  onChange,
}: HolePositionSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const handleXAnchorChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      onChange({ ...editable, xAnchor: details.value as AnchorSchema })
    },
    [editable, onChange],
  )
  const handleYAnchorChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      onChange({ ...editable, yAnchor: details.value as AnchorSchema })
    },
    [editable, onChange],
  )
  const handleXOffsetChange = useCallback(
    (xOffset: string): void => {
      onChange({ ...editable, xOffset })
    },
    [editable, onChange],
  )
  const handleYOffsetChange = useCallback(
    (yOffset: string): void => {
      onChange({ ...editable, yOffset })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.holes.position.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.holes.position.xAnchor.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.xAnchor}>
        <SegmentGroup.Root onValueChange={handleXAnchorChange} size="sm" value={editable.xAnchor}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="start">
            <SegmentGroup.ItemHiddenInput />
            <PiAlignLeftSimple /> {t.project.editors.enums.common.anchor.horizontal.start}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="middle">
            <SegmentGroup.ItemHiddenInput />
            <PiAlignCenterHorizontalSimple /> {t.project.editors.enums.common.anchor.horizontal.middle}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="end">
            <SegmentGroup.ItemHiddenInput />
            <PiAlignRightSimple /> {t.project.editors.enums.common.anchor.horizontal.end}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.holes.position.xOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.xOffset}>
        <NumberInput issue={issues.xOffset} onChange={handleXOffsetChange} unit="mm" value={editable.xOffset} />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.holes.position.yAnchor.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.yAnchor}>
        <SegmentGroup.Root onValueChange={handleYAnchorChange} size="sm" value={editable.yAnchor}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="start">
            <SegmentGroup.ItemHiddenInput />
            <PiAlignTopSimple /> {t.project.editors.enums.common.anchor.vertical.start}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="middle">
            <SegmentGroup.ItemHiddenInput />
            <PiAlignCenterVerticalSimple /> {t.project.editors.enums.common.anchor.vertical.middle}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="end">
            <SegmentGroup.ItemHiddenInput />
            <PiAlignBottomSimple /> {t.project.editors.enums.common.anchor.vertical.end}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.holes.position.yOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.yOffset}>
        <NumberInput issue={issues.yOffset} onChange={handleYOffsetChange} unit="mm" value={editable.yOffset} />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
