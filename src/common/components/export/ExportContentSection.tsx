import { Switch } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'

import { useTranslation } from '../../hooks/useTranslation'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type { ExportSettingsSchema } from '../../schemas/settings'
import { NumberInput } from '../common/NumberInput'
import { SectionGroup } from '../common/SectionGroup'

type ExportContentSectionProps = {
  editable: EditableSchema<ExportSettingsSchema>
  issues: IssuesSchema<ExportSettingsSchema>
  onChange: (updated: EditableSchema<ExportSettingsSchema>) => void
}

export function ExportContentSection({ editable, issues, onChange }: ExportContentSectionProps): ReactNode {
  const { t } = useTranslation()
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
  const handleShowParentNamesChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onChange({ ...editable, showParentNames: details.checked })
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

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.export.content.title}</SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.content.showNames.tooltip}>
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

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.content.showDimensions.tooltip}>
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

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.content.showParentNames.tooltip}>
        {t.project.editors.sections.export.content.showParentNames.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.showParentNames}>
        <Switch.Root checked={editable.showParentNames} onCheckedChange={handleShowParentNamesChange} size="sm">
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.content.childMarkers.tooltip}>
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

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.content.cutHelperDistance.tooltip}>
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
