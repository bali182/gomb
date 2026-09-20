import { HStack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import { PiArrowsHorizontal, PiArrowsVertical, PiRuler, PiWarningBold } from 'react-icons/pi'

import type { HasSqueezeSchema } from '../../../schemas/common'
import type { HasAutoDimensionsSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { useTranslation } from '../../../translations/translation'
import { AutoDimensionEditor } from '../../common/AutoDimensionEditor'
import { SectionGroup } from '../../common/SectionGroup'

type AutoSizeSectionProps<T> = {
  component: T
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function AutoSizeSection<T extends HasAutoDimensionsSchema & HasSqueezeSchema>({
  editable,
  issues,
  onChange,
}: AutoSizeSectionProps<T>) {
  const t = useTranslation()
  const hasActiveHorizontalSqueeze = editable.leftSqueeze !== '0' || editable.rightSqueeze !== '0'
  const hasActiveVerticalSqueeze = editable.topSqueeze !== '0' || editable.bottomSqueeze !== '0'
  const hasTransformedManualSize =
    (!editable.autoWidth && hasActiveHorizontalSqueeze) || (!editable.autoHeight && hasActiveVerticalSqueeze)

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
                {t.component.editor.squeeze.active}
              </Text>
            </HStack>
          ) : undefined
        }
      >
        {t.common.labels.size}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle>{t.common.labels.width}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.width}>
        <AutoDimensionEditor
          ariaLabel={t.common.labels.width}
          auto={editable.autoWidth}
          autoIcon={PiArrowsHorizontal}
          placeholder={t.common.placeholders.fill}
          issue={issues.width}
          manualIcon={PiRuler}
          onAutoChange={handleAutoWidthChange}
          onValueChange={handleWidthChange}
          step={1}
          unit="mm"
          value={editable.width}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.common.labels.height}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.height}>
        <AutoDimensionEditor
          ariaLabel={t.common.labels.height}
          auto={editable.autoHeight}
          autoIcon={PiArrowsVertical}
          placeholder={t.common.placeholders.fill}
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
