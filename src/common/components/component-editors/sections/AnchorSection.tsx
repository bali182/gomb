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

import type { AnchorSchema, HasOffAxisAnchor } from '../../../schemas/common'
import type { ComponentSchema, HasAutoDimensionsSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { useTranslation } from '../../../translations/translation'
import { SectionGroup } from '../../common/SectionGroup'

type AnchorSectionProps<T> = {
  parent: ComponentSchema
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function AnchorSection<T extends HasOffAxisAnchor & HasAutoDimensionsSchema>({
  parent,
  editable,
  issues,
  onChange,
}: AnchorSectionProps<T>): ReactNode {
  const t = useTranslation()

  const isOffAxisFill = parent.layoutOrientation === 'horizontal' ? editable.autoHeight : editable.autoWidth

  const handleOffAxisAnchorChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails) => {
      onChange({ ...editable, offAxisAnchor: details.value as AnchorSchema })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.component.editor.anchor.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle>{t.component.editor.anchor.title}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.offAxisAnchor}>
        <SegmentGroup.Root
          disabled={isOffAxisFill}
          onValueChange={handleOffAxisAnchorChange}
          size="sm"
          value={isOffAxisFill ? null : editable.offAxisAnchor}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="start">
            <SegmentGroup.ItemHiddenInput />
            {parent.layoutOrientation === 'horizontal' ? <PiAlignTopSimple /> : <PiAlignLeftSimple />}
            {parent.layoutOrientation === 'horizontal' ? t.common.anchors.top : t.common.anchors.left}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="middle">
            <SegmentGroup.ItemHiddenInput />
            {parent.layoutOrientation === 'horizontal' ? (
              <PiAlignCenterVerticalSimple />
            ) : (
              <PiAlignCenterHorizontalSimple />
            )}
            {t.common.anchors.center}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="end">
            <SegmentGroup.ItemHiddenInput />
            {parent.layoutOrientation === 'horizontal' ? <PiAlignBottomSimple /> : <PiAlignRightSimple />}
            {parent.layoutOrientation === 'horizontal' ? t.common.anchors.bottom : t.common.anchors.right}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
