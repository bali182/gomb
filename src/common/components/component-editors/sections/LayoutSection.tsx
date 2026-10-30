import { HStack, SegmentGroup, Text } from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import {
  PiAlignBottomSimple,
  PiAlignCenterHorizontalSimple,
  PiAlignCenterVerticalSimple,
  PiAlignLeftSimple,
  PiAlignRightSimple,
  PiAlignTopSimple,
  PiArrowsHorizontal,
  PiArrowsVertical,
  PiColumns,
  PiInfo,
  PiRows,
  PiRuler,
} from 'react-icons/pi'

import { useSubProject } from '../../../hooks/useSubProject'
import { useTranslation } from '../../../hooks/useTranslation'
import type { ComponentSchema, HasLayoutSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { EditorFieldTranslationSchema } from '../../../schemas/translation'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'
import { AutoDimensionEditor } from '../../common/AutoDimensionEditor'
import { SectionGroup } from '../../common/SectionGroup'
import { Tooltip } from '../../common/Tooltip'

type LayoutSectionProps<T extends ComponentSchema & HasLayoutSchema> = {
  component: T
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function LayoutSection<T extends ComponentSchema & HasLayoutSchema>({
  component,
  editable,
  issues,
  onChange,
}: LayoutSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const { subProject } = useSubProject()
  const fillTranslation = useMemo<EditorFieldTranslationSchema | undefined>(() => {
    const children = accessors
      .subProject(subProject)
      .component.children(component.id)
      .filter((child) => narrowers.is.panel(child) || narrowers.is.pocketCluster(child))
    const hasFillChild = children.some((child) =>
      editable.layoutOrientation === 'horizontal' ? child.autoWidth : child.autoHeight,
    )
    const hasFillGap = editable.autoLayoutGap && children.length > 1
    if (hasFillChild && hasFillGap) {
      return t.project.editors.sections.components.layout.fillChildAndGap
    }
    if (hasFillChild) {
      return t.project.editors.sections.components.layout.fillChild
    }
    if (hasFillGap) {
      return t.project.editors.sections.components.layout.fillGap
    }
    return undefined
  }, [component, subProject, editable.layoutOrientation, editable.autoLayoutGap, t])

  const anchorLabels =
    editable.layoutOrientation === 'horizontal'
      ? t.project.editors.enums.common.anchor.horizontal
      : t.project.editors.enums.common.anchor.vertical

  const handleMainAxisAnchorChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      onChange({ ...editable, mainAxisAnchor: details.value })
    },
    [editable, onChange],
  )
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
      <SectionGroup.SectionHeader
        rightAddon={
          isDefined(fillTranslation) ? (
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
        {t.project.editors.sections.components.layout.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.layout.layoutOrientation.tooltip}>
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

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.layout.mainAxisAnchor.tooltip}>
        {t.project.editors.sections.components.layout.mainAxisAnchor.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.mainAxisAnchor}>
        <SegmentGroup.Root
          disabled={isDefined(fillTranslation)}
          onValueChange={handleMainAxisAnchorChange}
          size="sm"
          value={isDefined(fillTranslation) ? null : editable.mainAxisAnchor}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="start">
            <SegmentGroup.ItemHiddenInput />
            {editable.layoutOrientation === 'horizontal' ? <PiAlignLeftSimple /> : <PiAlignTopSimple />}
            {anchorLabels.start}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="middle">
            <SegmentGroup.ItemHiddenInput />
            {editable.layoutOrientation === 'horizontal' ? (
              <PiAlignCenterHorizontalSimple />
            ) : (
              <PiAlignCenterVerticalSimple />
            )}
            {anchorLabels.middle}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="end">
            <SegmentGroup.ItemHiddenInput />
            {editable.layoutOrientation === 'horizontal' ? <PiAlignRightSimple /> : <PiAlignBottomSimple />}
            {anchorLabels.end}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.layout.layoutGap.tooltip}>
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
