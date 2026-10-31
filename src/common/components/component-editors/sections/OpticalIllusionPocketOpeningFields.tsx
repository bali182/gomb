import {
  HStack,
  Link,
  Select,
  Text,
  createListCollection,
  type ListCollection,
  type SelectValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiYoutubeLogoFill } from 'react-icons/pi'
import { EditorSelect } from '../../common/EditorSelect'

import { useTranslation } from '../../../hooks/useTranslation'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSideSchema,
  PocketOrientationSchema,
} from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { isDefined } from '../../../utils/isDefined'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type OpticalIllusionPocketOpeningFieldsProps = {
  modelId: string
  editable: EditableSchema<OpticalIllusionPocketOpeningSchema>
  issues: IssuesSchema<OpticalIllusionPocketOpeningSchema>
  orientation: PocketOrientationSchema
  onChange: (updated: EditableSchema<OpticalIllusionPocketOpeningSchema>) => void
}

const sides: PocketOpeningSideSchema[] = ['start', 'end']

export const OpticalIllusionPocketOpeningFields: FC<OpticalIllusionPocketOpeningFieldsProps> = ({
  modelId,
  editable,
  issues,
  orientation,
  onChange,
}) => {
  const { t } = useTranslation()
  const collection = useMemo<ListCollection<PocketOpeningSideSchema>>(
    () =>
      createListCollection<PocketOpeningSideSchema>({
        items: sides,
        itemToValue: (side) => side,
        itemToString: (side) => t.project.editors.enums.components.slantedPocketOpeningSide[orientation][side],
      }),
    [orientation, t],
  )
  const selectedValue = useMemo<string[]>(() => [editable.direction], [editable.direction])
  const handleStartInsetChange = useCallback(
    (startInset: string): void => {
      onChange({ ...editable, startInset })
    },
    [editable, onChange],
  )
  const handleEndInsetChange = useCallback(
    (endInset: string): void => {
      onChange({ ...editable, endInset })
    },
    [editable, onChange],
  )
  const handleLeadingRadiusChange = useCallback(
    (leadingRadius: string): void => {
      onChange({ ...editable, leadingRadius })
    },
    [editable, onChange],
  )
  const handleTrailingRadiusChange = useCallback(
    (trailingRadius: string): void => {
      onChange({ ...editable, trailingRadius })
    },
    [editable, onChange],
  )
  const handleDirectionChange = useCallback(
    (details: SelectValueChangeDetails<PocketOpeningSideSchema>): void => {
      const side = details.items[0]
      if (isDefined(side)) {
        onChange({ ...editable, direction: side })
      }
    },
    [editable, onChange],
  )

  return (
    <>
      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.opticalIllusionPocketOpening.direction.tooltip}
      >
        {t.project.editors.sections.components.opticalIllusionPocketOpening.direction.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.direction}>
        <EditorSelect
          collection={collection}
          value={selectedValue}
          onValueChange={handleDirectionChange}
          positioning={{ strategy: 'fixed', sameWidth: true }}
          size="xs"
          width="full"
          minW="0"
          invalid={issues.direction?.severity === 'error'}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content width="full">
              {collection.items.map((side) => (
                <Select.Item key={side} item={side}>
                  {t.project.editors.enums.components.slantedPocketOpeningSide[orientation][side]}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </EditorSelect>
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.opticalIllusionPocketOpening.startInset.tooltip}
      >
        {t.project.editors.sections.components.opticalIllusionPocketOpening.startInset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.startInset}>
        <EditorNumberInput
          modelId={modelId}
          field="opening.startInset"
          value={editable.startInset}
          issue={issues.startInset}
          onChange={handleStartInsetChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.opticalIllusionPocketOpening.endInset.tooltip}
      >
        {t.project.editors.sections.components.opticalIllusionPocketOpening.endInset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.endInset}>
        <EditorNumberInput
          modelId={modelId}
          field="opening.endInset"
          value={editable.endInset}
          issue={issues.endInset}
          onChange={handleEndInsetChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.opticalIllusionPocketOpening.leadingRadius.tooltip}
      >
        {t.project.editors.sections.components.opticalIllusionPocketOpening.leadingRadius.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.leadingRadius}>
        <EditorNumberInput
          modelId={modelId}
          field="opening.leadingRadius"
          value={editable.leadingRadius}
          issue={issues.leadingRadius}
          onChange={handleLeadingRadiusChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.components.opticalIllusionPocketOpening.trailingRadius.tooltip}
      >
        {t.project.editors.sections.components.opticalIllusionPocketOpening.trailingRadius.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.trailingRadius}>
        <EditorNumberInput
          modelId={modelId}
          field="opening.trailingRadius"
          value={editable.trailingRadius}
          issue={issues.trailingRadius}
          onChange={handleTrailingRadiusChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionFullWidthContent>
        <HStack justifyContent="center" flexWrap="wrap" gap="1.5" py="1" textStyle="xs" color="fg.muted">
          <HStack gap="1">
            <Text>{t.project.editors.sections.components.opticalIllusionPocketOpeningCredit.designBy}</Text>
            <Link href="https://corterleather.com/" target="_blank" rel="noopener noreferrer" fontWeight="bold">
              Corter Leather
            </Link>
          </HStack>
          <Text>•</Text>
          <HStack gap="1">
            <Link
              href="https://www.youtube.com/watch?v=_ujdI7Grl20"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
            >
              <PiYoutubeLogoFill /> YouTube
            </Link>
          </HStack>
        </HStack>
      </SectionGroup.SectionFullWidthContent>
    </>
  )
}
