import {
  Select,
  Switch,
  createListCollection,
  type ListCollection,
  type SelectValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type ReactNode } from 'react'

import { useTranslation2 } from '../../hooks/useTranslation2'
import type { EditableSchema } from '../../schemas/editable'
import type { BaseExportSettingsSchema, ExportStitchLineModeSchema } from '../../schemas/settings'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { isDefined } from '../../utils/isDefined'
import { NumberInput } from '../common/NumberInput'
import { SectionGroup } from '../common/SectionGroup'

type ExportStitchLineModeOption = {
  label: string
  value: ExportStitchLineModeSchema
}

type ExportContentSectionProps<T extends BaseExportSettingsSchema> = {
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<BaseExportSettingsSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function ExportContentSection<T extends BaseExportSettingsSchema>({
  editable,
  issues,
  onChange,
}: ExportContentSectionProps<T>): ReactNode {
  const { t } = useTranslation2()
  const stitchLineModeOptions = useMemo<ExportStitchLineModeOption[]>(
    () => [
      {
        label: t.project.editors.enums.export.exportStitchLineModes['own-stitch-lines'],
        value: 'own-stitch-lines',
      },
      {
        label: t.project.editors.enums.export.exportStitchLineModes['related-stitch-lines'],
        value: 'related-stitch-lines',
      },
      {
        label: t.project.editors.enums.export.exportStitchLineModes['all-stitch-lines'],
        value: 'all-stitch-lines',
      },
    ],
    [t],
  )
  const stitchLineModeCollection = useMemo<ListCollection<ExportStitchLineModeOption>>(
    () =>
      createListCollection<ExportStitchLineModeOption>({
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        items: stitchLineModeOptions,
      }),
    [stitchLineModeOptions],
  )
  const handleStitchLineModeChange = useCallback(
    (details: SelectValueChangeDetails<ExportStitchLineModeOption>): void => {
      const stitchLineMode = details.value[0]

      if (!isDefined(stitchLineMode)) {
        return
      }

      onChange({ ...editable, stitchLineMode: stitchLineMode as ExportStitchLineModeSchema })
    },
    [editable, onChange],
  )
  const handleShowNamesChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onChange({ ...editable, showNames: details.checked })
    },
    [editable, onChange],
  )
  const handleShowDimensionsChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onChange({ ...editable, showDimensions: details.checked })
    },
    [editable, onChange],
  )
  const handleChildMarkersChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onChange({ ...editable, childMarkers: details.checked })
    },
    [editable, onChange],
  )
  const handleCutHelperDistanceChange = useCallback(
    (cutHelperDistance: string): void => {
      onChange({ ...editable, cutHelperDistance })
    },
    [editable, onChange],
  )

  const hasStitchLineModeError = isDefined(issues.stitchLineMode) && issues.stitchLineMode.severity === 'error'

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.export.content.title}</SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.export.content.stitchLineMode.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchLineMode}>
        <Select.Root
          aria-invalid={hasStitchLineModeError}
          collection={stitchLineModeCollection}
          onValueChange={handleStitchLineModeChange}
          size="xs"
          value={[editable.stitchLineMode]}
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
            <Select.Content>
              {stitchLineModeCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.export.content.showNames.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.showNames}>
        <Switch.Root checked={editable.showNames} onCheckedChange={handleShowNamesChange} size="sm">
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.export.content.showDimensions.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.showDimensions}>
        <Switch.Root checked={editable.showDimensions} onCheckedChange={handleShowDimensionsChange} size="sm">
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.export.content.childMarkers.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.childMarkers}>
        <Switch.Root checked={editable.childMarkers} onCheckedChange={handleChildMarkersChange} size="sm">
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.export.content.cutHelperDistance.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.cutHelperDistance}>
        <NumberInput
          issue={issues.cutHelperDistance}
          onChange={handleCutHelperDistanceChange}
          unit="mm"
          value={editable.cutHelperDistance}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
