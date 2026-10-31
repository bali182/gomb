import { HStack, SegmentGroup, Text } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import {
  PiAlignBottomSimple,
  PiAlignCenterHorizontalSimple,
  PiAlignCenterVerticalSimple,
  PiAlignLeftSimple,
  PiAlignRightSimple,
  PiAlignTopSimple,
  PiInfo,
} from 'react-icons/pi'
import { EditorSegmentGroup } from '../../common/EditorSegmentGroup'

import { useTranslation } from '../../../hooks/useTranslation'
import type { AnchorSchema, HasOffAxisAnchor } from '../../../schemas/common'
import type { ComponentSchema, HasAutoDimensionsSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { EditorFieldTranslationSchema } from '../../../schemas/translation'
import { narrowers } from '../../../utils/narrowers'
import { SectionGroup } from '../../common/SectionGroup'
import { Tooltip } from '../../common/Tooltip'

type AnchorSectionProps<T> = {
  parent: ComponentSchema
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function AnchorSection<T extends HasOffAxisAnchor & HasAutoDimensionsSchema>({
  parent,
  editable,
  issues,
  onChange,
}: AnchorSectionProps<T>): ReactNode {
  const { t } = useTranslation()

  const isOffAxisFill = useMemo<boolean>(() => {
    if (narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)) {
      if (parent.layoutOrientation === 'vertical') {
        return editable.autoWidth
      }
    }
    return editable.autoHeight
  }, [parent, editable.autoHeight, editable.autoWidth])

  const fillTranslation = useMemo<EditorFieldTranslationSchema>(() => {
    if (narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)) {
      if (parent.layoutOrientation === 'vertical') {
        return t.project.editors.sections.components.anchor.widthFill
      }
    }
    return t.project.editors.sections.components.anchor.heightFill
  }, [parent, t])

  const handleOffAxisAnchorChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails) => {
      onChange({ ...editable, offAxisAnchor: details.value as AnchorSchema })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          isOffAxisFill ? (
            <Tooltip content={fillTranslation.tooltip}>
              <HStack color="fg.info" gap="1">
                <PiInfo />
                <Text fontWeight="bold" textStyle="xs">
                  {fillTranslation.label}
                </Text>
              </HStack>
            </Tooltip>
          ) : undefined
        }
      >
        {t.project.editors.sections.components.anchor.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.anchor.offAxisAnchor.tooltip}>
        {t.project.editors.sections.components.anchor.offAxisAnchor.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.offAxisAnchor}>
        <EditorSegmentGroup
          disabled={isOffAxisFill}
          onValueChange={handleOffAxisAnchorChange}
          size="sm"
          value={isOffAxisFill ? null : editable.offAxisAnchor}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="start">
            <SegmentGroup.ItemHiddenInput />
            {(narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)
              ? parent.layoutOrientation
              : 'horizontal') === 'horizontal' ? (
              <PiAlignTopSimple />
            ) : (
              <PiAlignLeftSimple />
            )}
            {(narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)
              ? parent.layoutOrientation
              : 'horizontal') === 'horizontal'
              ? t.project.editors.enums.common.anchor.vertical.start
              : t.project.editors.enums.common.anchor.horizontal.start}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="middle">
            <SegmentGroup.ItemHiddenInput />
            {(narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)
              ? parent.layoutOrientation
              : 'horizontal') === 'horizontal' ? (
              <PiAlignCenterVerticalSimple />
            ) : (
              <PiAlignCenterHorizontalSimple />
            )}
            {(narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)
              ? parent.layoutOrientation
              : 'horizontal') === 'horizontal'
              ? t.project.editors.enums.common.anchor.vertical.middle
              : t.project.editors.enums.common.anchor.horizontal.middle}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="end">
            <SegmentGroup.ItemHiddenInput />
            {(narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)
              ? parent.layoutOrientation
              : 'horizontal') === 'horizontal' ? (
              <PiAlignBottomSimple />
            ) : (
              <PiAlignRightSimple />
            )}
            {(narrowers.is.rootPanel(parent) || narrowers.is.panel(parent) || narrowers.is.frontPocket(parent)
              ? parent.layoutOrientation
              : 'horizontal') === 'horizontal'
              ? t.project.editors.enums.common.anchor.vertical.end
              : t.project.editors.enums.common.anchor.horizontal.end}
          </SegmentGroup.Item>
        </EditorSegmentGroup>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
