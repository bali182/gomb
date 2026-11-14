import { HStack, Text } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'
import { PiInfo } from 'react-icons/pi'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { Tooltip } from '../../common/Tooltip'

import { useTranslation } from '../../../hooks/useTranslation'
import type { HasPocketItemSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import type { PocketItemIdSchema, PocketItemOrientationSchema } from '../../../schemas/pocketItem'
import { isDefined } from '../../../utils/isDefined'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { PocketItemCombobox } from '../../common/PocketItemCombobox'
import { PocketItemOrientationSelect } from '../../common/PocketItemOrientationSelect'
import { SectionGroup } from '../../common/SectionGroup'

type ContentsSectionProps<T extends HasPocketItemSchema> = {
  modelId: string
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export const ContentsSection = <T extends HasPocketItemSchema>({
  modelId,
  editable,
  issues,
  onChange,
}: ContentsSectionProps<T>): ReactNode => {
  const { t } = useTranslation()
  const { settings } = useGlobalSettings()
  const hasItem = isDefined(editable.itemId)

  const handleItemIdChange = useCallback(
    (itemId: PocketItemIdSchema): void => {
      onChange({ ...editable, itemId })
    },
    [editable, onChange],
  )

  const handleItemIdReset = useCallback((): void => {
    onChange({
      ...editable,
      itemId: undefined,
    })
  }, [editable, onChange])

  const handleCardCrossAxisOffsetChange = useCallback(
    (itemCrossAxisOffset: string): void => {
      onChange({ ...editable, itemCrossAxisOffset })
    },
    [editable, onChange],
  )

  const handleCardOpeningOffsetChange = useCallback(
    (itemOpeningOffset: string): void => {
      onChange({ ...editable, itemOpeningOffset })
    },
    [editable, onChange],
  )

  const handleOrientationChange = useCallback(
    (itemOrientation: PocketItemOrientationSchema): void => {
      onChange({ ...editable, itemOrientation })
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
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.contents.itemId.tooltip}>
        {t.project.editors.sections.components.contents.itemId.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.itemId}>
        <PocketItemCombobox
          isResetEnabled={hasItem}
          issue={issues.itemId}
          onChange={handleItemIdChange}
          onReset={handleItemIdReset}
          value={editable.itemId}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.contents.itemOrientation.tooltip}>
        {t.project.editors.sections.components.contents.itemOrientation.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.itemOrientation}>
        <PocketItemOrientationSelect
          disabled={!hasItem}
          onChange={handleOrientationChange}
          value={editable.itemOrientation}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.contents.itemCrossAxisOffset.tooltip}
      >
        {t.project.editors.sections.components.contents.itemCrossAxisOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.itemCrossAxisOffset}>
        <EditorNumberInput
          modelId={modelId}
          field="itemCrossAxisOffset"
          disabled={!hasItem}
          issue={issues.itemCrossAxisOffset}
          onChange={handleCardCrossAxisOffsetChange}
          unit="mm"
          value={editable.itemCrossAxisOffset}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.contents.itemOpeningOffset.tooltip}>
        {t.project.editors.sections.components.contents.itemOpeningOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.itemOpeningOffset}>
        <EditorNumberInput
          modelId={modelId}
          field="itemOpeningOffset"
          disabled={!hasItem}
          issue={issues.itemOpeningOffset}
          onChange={handleCardOpeningOffsetChange}
          unit="mm"
          value={editable.itemOpeningOffset}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
