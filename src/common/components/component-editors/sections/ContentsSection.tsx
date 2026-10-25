import { HStack, SegmentGroup, Text } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'
import { PiCreditCard, PiInfo } from 'react-icons/pi'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { Tooltip } from '../../common/Tooltip'

import { useTranslation } from '../../../hooks/useTranslation'
import type { HasPocketItemSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { CardSchemaId } from '../../../schemas/pocketItem'
import { isDefined } from '../../../utils/isDefined'
import { CardCombobox } from '../../common/CardCombobox'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type ContentsSectionProps<T extends HasPocketItemSchema> = {
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export const ContentsSection = <T extends HasPocketItemSchema>({
  editable,
  issues,
  onChange,
}: ContentsSectionProps<T>): ReactNode => {
  const { t } = useTranslation()
  const { settings } = useGlobalSettings()
  const hasCard = isDefined(editable.pocketItemId)

  const handleCardIdChange = useCallback(
    (pocketItemId: CardSchemaId): void => {
      onChange({ ...editable, pocketItemId })
    },
    [editable, onChange],
  )

  const handleCardIdReset = useCallback((): void => {
    onChange({
      ...editable,
      pocketItemId: undefined,
      pocketItemOrientation: 'landscape',
      pocketItemCrossAxisOffset: '0',
      pocketItemOpeningOffset: '0',
    })
  }, [editable, onChange])

  const handleCardCrossAxisOffsetChange = useCallback(
    (pocketItemCrossAxisOffset: string): void => {
      onChange({ ...editable, pocketItemCrossAxisOffset })
    },
    [editable, onChange],
  )

  const handleCardOpeningOffsetChange = useCallback(
    (pocketItemOpeningOffset: string): void => {
      onChange({ ...editable, pocketItemOpeningOffset })
    },
    [editable, onChange],
  )

  const handleOrientationChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      onChange({ ...editable, pocketItemOrientation: details.value })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader
        rightAddon={
          !settings.view.pocketItemsVisible && (
            <Tooltip content={t.project.editors.sections.components.contents.itemsHidden.tooltip}>
              <HStack gap="1" color="fg.info">
                <PiInfo />
                <Text textStyle="xs">{t.project.editors.sections.components.contents.itemsHidden.label}</Text>
              </HStack>
            </Tooltip>
          )
        }
      >
        {t.project.editors.sections.components.contents.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.contents.pocketItemId.tooltip}>
        {t.project.editors.sections.components.contents.pocketItemId.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketItemId}>
        <CardCombobox
          isResetEnabled={hasCard}
          issue={issues.pocketItemId}
          onChange={handleCardIdChange}
          onReset={handleCardIdReset}
          value={editable.pocketItemId}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.contents.pocketItemOrientation.tooltip}
      >
        {t.project.editors.sections.components.contents.pocketItemOrientation.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketItemOrientation}>
        <SegmentGroup.Root
          disabled={!hasCard}
          onValueChange={handleOrientationChange}
          size="sm"
          value={editable.pocketItemOrientation}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="landscape">
            <SegmentGroup.ItemHiddenInput />
            <PiCreditCard />
            {t.project.editors.enums.components.pocketItemOrientation.landscape}
          </SegmentGroup.Item>
          <SegmentGroup.Item value="portrait">
            <SegmentGroup.ItemHiddenInput />
            <PiCreditCard style={{ transform: 'rotate(90deg)' }} />
            {t.project.editors.enums.components.pocketItemOrientation.portrait}
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.contents.pocketItemCrossAxisOffset.tooltip}
      >
        {t.project.editors.sections.components.contents.pocketItemCrossAxisOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketItemCrossAxisOffset}>
        <NumberInput
          disabled={!hasCard}
          issue={issues.pocketItemCrossAxisOffset}
          onChange={handleCardCrossAxisOffsetChange}
          unit="mm"
          value={editable.pocketItemCrossAxisOffset}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.contents.pocketItemOpeningOffset.tooltip}
      >
        {t.project.editors.sections.components.contents.pocketItemOpeningOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketItemOpeningOffset}>
        <NumberInput
          disabled={!hasCard}
          issue={issues.pocketItemOpeningOffset}
          onChange={handleCardOpeningOffsetChange}
          unit="mm"
          value={editable.pocketItemOpeningOffset}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
