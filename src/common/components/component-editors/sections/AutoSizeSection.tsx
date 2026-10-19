import { HStack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import { PiArrowsHorizontal, PiArrowsVertical, PiRuler, PiWarningBold } from 'react-icons/pi'

import { useTranslation } from '../../../hooks/useTranslation'
import type { HasStretchSchema } from '../../../schemas/common'
import type { HasAutoDimensionsSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { AutoDimensionEditor } from '../../common/AutoDimensionEditor'
import { SectionGroup } from '../../common/SectionGroup'

type AutoSizeSectionProps<T> = {
  component: T
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function AutoSizeSection<T extends HasAutoDimensionsSchema & HasStretchSchema>({
  component,
  editable,
  issues,
  onChange,
}: AutoSizeSectionProps<T>) {
  const { t } = useTranslation()
  const hasActiveHorizontalStretch = component.leftStretch !== 0 || component.rightStretch !== 0
  const hasActiveVerticalStretch = component.topStretch !== 0 || component.bottomStretch !== 0
  const hasTransformedManualSize =
    (!component.autoWidth && hasActiveHorizontalStretch) || (!component.autoHeight && hasActiveVerticalStretch)

  const handleAutoWidthChange = useCallback(
    (autoWidth: boolean) => {
      onChange({
        ...editable,
        autoWidth,
      })
    },
    [editable, onChange],
  )

  const handleAutoHeightChange = useCallback(
    (autoHeight: boolean) => {
      onChange({
        ...editable,
        autoHeight,
      })
    },
    [editable, onChange],
  )

  const handleWidthChange = useCallback(
    (width: string) => {
      onChange({
        ...editable,
        width,
      })
    },
    [editable, onChange],
  )

  const handleHeightChange = useCallback(
    (height: string) => {
      onChange({
        ...editable,
        height,
      })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          hasTransformedManualSize ? (
            <HStack color="fg.warning" gap="1">
              <PiWarningBold />
              <Text fontWeight="bold" textStyle="xs">
                {t.project.editors.sections.components.autoSize.stretchActive}
              </Text>
            </HStack>
          ) : undefined
        }
      >
        {t.project.editors.sections.components.autoSize.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.autoSize.width.tooltip}>
        {t.project.editors.sections.components.autoSize.width.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.width}>
        <AutoDimensionEditor
          auto={editable.autoWidth}
          autoIcon={PiArrowsHorizontal}
          placeholder={t.project.editors.sections.components.autoSize.width.placeholder}
          issue={issues.width}
          manualIcon={PiRuler}
          onAutoChange={handleAutoWidthChange}
          onValueChange={handleWidthChange}
          step={1}
          unit="mm"
          value={editable.width}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.autoSize.height.tooltip}>
        {t.project.editors.sections.components.autoSize.height.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.height}>
        <AutoDimensionEditor
          auto={editable.autoHeight}
          autoIcon={PiArrowsVertical}
          placeholder={t.project.editors.sections.components.autoSize.height.placeholder}
          issue={issues.height}
          manualIcon={PiRuler}
          onAutoChange={handleAutoHeightChange}
          onValueChange={handleHeightChange}
          step={1}
          unit="mm"
          value={editable.height}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
