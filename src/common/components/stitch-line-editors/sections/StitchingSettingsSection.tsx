import { useCallback, type ReactNode } from 'react'

import { useTranslation2 } from '../../../hooks/useTranslation2'
import type { EditableSchema } from '../../../schemas/editable'
import type { StitchLineCommonConfigSchema } from '../../../schemas/stitching'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { isDefined } from '../../../utils/isDefined'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'
import { StitchHoleDistanceEditor } from '../StitchHoleDistanceEditor'

type StitchingSettingsSectionProps<T extends Partial<StitchLineCommonConfigSchema>> = {
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
  onReset?: (key: keyof StitchLineCommonConfigSchema) => void
  resolvedEditable: EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<T>
}

export const StitchingSettingsSection = <T extends Partial<StitchLineCommonConfigSchema>>({
  editable,
  issues,
  onChange,
  onReset,
  resolvedEditable,
}: StitchingSettingsSectionProps<T>): ReactNode => {
  const { t } = useTranslation2()
  const handleStitchMarginChange = useCallback(
    (nextStitchMargin: string): void => {
      onChange({ ...editable, stitchMargin: nextStitchMargin })
    },
    [editable, onChange],
  )
  const handleStitchHoleLengthChange = useCallback(
    (nextStitchHoleLength: string): void => {
      onChange({ ...editable, stitchHoleLength: nextStitchHoleLength })
    },
    [editable, onChange],
  )
  const handleStitchHoleDistanceChange = useCallback(
    (nextStitchHoleDistance: string): void => {
      onChange({ ...editable, stitchHoleDistance: nextStitchHoleDistance })
    },
    [editable, onChange],
  )
  const handleStitchHoleThicknessChange = useCallback(
    (nextStitchHoleThickness: string): void => {
      onChange({ ...editable, stitchHoleThickness: nextStitchHoleThickness })
    },
    [editable, onChange],
  )
  const handleStitchLineThicknessChange = useCallback(
    (nextStitchLineThickness: string): void => {
      onChange({ ...editable, stitchLineThickness: nextStitchLineThickness })
    },
    [editable, onChange],
  )
  const handleStitchMarginReset = useCallback((): void => {
    onReset?.('stitchMargin')
  }, [onReset])
  const handleStitchHoleLengthReset = useCallback((): void => {
    onReset?.('stitchHoleLength')
  }, [onReset])
  const handleStitchHoleDistanceReset = useCallback((): void => {
    onReset?.('stitchHoleDistance')
  }, [onReset])
  const handleStitchHoleThicknessReset = useCallback((): void => {
    onReset?.('stitchHoleThickness')
  }, [onReset])
  const handleStitchLineThicknessReset = useCallback((): void => {
    onReset?.('stitchLineThickness')
  }, [onReset])

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.stitchLines.settings.title}</SectionGroup.SectionHeader>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.stitchLines.settings.stitchMargin.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchMargin}>
        <NumberInput
          issue={issues.stitchMargin}
          onChange={handleStitchMarginChange}
          onReset={isDefined(onReset) ? handleStitchMarginReset : undefined}
          isResetEnabled={isDefined(editable.stitchMargin)}
          unit="mm"
          value={resolvedEditable.stitchMargin}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.stitchLines.settings.stitchHoleLength.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchHoleLength}>
        <NumberInput
          issue={issues.stitchHoleLength}
          onChange={handleStitchHoleLengthChange}
          onReset={isDefined(onReset) ? handleStitchHoleLengthReset : undefined}
          isResetEnabled={isDefined(editable.stitchHoleLength)}
          unit="mm"
          value={resolvedEditable.stitchHoleLength}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.stitchLines.settings.stitchHoleDistance.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchHoleDistance}>
        <StitchHoleDistanceEditor
          issue={issues.stitchHoleDistance}
          onChange={handleStitchHoleDistanceChange}
          onReset={isDefined(onReset) ? handleStitchHoleDistanceReset : undefined}
          isResetEnabled={isDefined(editable.stitchHoleDistance)}
          value={resolvedEditable.stitchHoleDistance}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.stitchLines.settings.stitchHoleThickness.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchHoleThickness}>
        <NumberInput
          issue={issues.stitchHoleThickness}
          onChange={handleStitchHoleThicknessChange}
          onReset={isDefined(onReset) ? handleStitchHoleThicknessReset : undefined}
          isResetEnabled={isDefined(editable.stitchHoleThickness)}
          unit="mm"
          value={resolvedEditable.stitchHoleThickness}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.stitchLines.settings.stitchLineThickness.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchLineThickness}>
        <NumberInput
          issue={issues.stitchLineThickness}
          onChange={handleStitchLineThicknessChange}
          onReset={isDefined(onReset) ? handleStitchLineThicknessReset : undefined}
          isResetEnabled={isDefined(editable.stitchLineThickness)}
          unit="mm"
          value={resolvedEditable.stitchLineThickness}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
