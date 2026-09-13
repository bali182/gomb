import { useCallback, type FC } from 'react'

import {
  cardColors,
  leatherColors,
  selectionColors,
  stitchHoleColors,
  stitchLineColors,
  strokeColors,
  threadColors,
} from '../../data/colors'
import { useColors } from '../../hooks/useColors'
import type { EditableSchema } from '../../schemas/editable'
import type { ProjectSchema } from '../../schemas/project'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { useTranslation } from '../../translations/translation'
import { ColorInput } from '../common/ColorInput'
import { SectionGroup } from '../common/SectionGroup'

type ProjectComponentSettingsSectionProps = {
  editable: EditableSchema<ProjectSchema>
  issues: ValidationIssuesSchema<ProjectSchema>
  onChange: (updated: EditableSchema<ProjectSchema>) => void
}

export const ColorSettingsSections: FC<ProjectComponentSettingsSectionProps> = ({ editable, issues, onChange }) => {
  const t = useTranslation()
  const leatherColorValues = useColors(leatherColors)
  const threadColorValues = useColors(threadColors)
  const stitchHoleColorValues = useColors(stitchHoleColors)
  const stitchLineColorValues = useColors(stitchLineColors)
  const strokeColorValues = useColors(strokeColors)
  const selectionColorValues = useColors(selectionColors)
  const cardColorValues = useColors(cardColors)

  const handleLeatherColorChange = useCallback(
    (baseColor: string): void => {
      onChange({
        ...editable,
        colorSettings: {
          ...editable.colorSettings,
          leatherColor: baseColor,
        },
      })
    },
    [editable, onChange],
  )

  const handleStitchHoleColorChange = useCallback(
    (stitchHoleColor: string): void => {
      onChange({
        ...editable,
        colorSettings: {
          ...editable.colorSettings,
          stitchHoleColor,
        },
      })
    },
    [editable, onChange],
  )

  const handleStitchLineColorChange = useCallback(
    (stitchLineColor: string): void => {
      onChange({
        ...editable,
        colorSettings: {
          ...editable.colorSettings,
          stitchLineColor,
        },
      })
    },
    [editable, onChange],
  )

  const handleThreadColorChange = useCallback(
    (threadColor: string): void => {
      onChange({
        ...editable,
        colorSettings: {
          ...editable.colorSettings,
          threadColor,
        },
      })
    },
    [editable, onChange],
  )

  const handleStrokeColorChange = useCallback(
    (strokeColor: string): void => {
      onChange({
        ...editable,
        colorSettings: {
          ...editable.colorSettings,
          strokeColor,
        },
      })
    },
    [editable, onChange],
  )

  const handleSelectionColorChange = useCallback(
    (selectionColor: string): void => {
      onChange({
        ...editable,
        colorSettings: {
          ...editable.colorSettings,
          selectionColor,
        },
      })
    },
    [editable, onChange],
  )

  const handleCardColorChange = useCallback(
    (cardColor: string): void => {
      onChange({
        ...editable,
        colorSettings: {
          ...editable.colorSettings,
          cardColor,
        },
      })
    },
    [editable, onChange],
  )

  return (
    <>
      {/* Components */}
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>{t.projects.settingsDialog.colorSettings.leatherTitle}</SectionGroup.SectionHeader>

        <SectionGroup.SectionRowTitle>
          {t.projects.settingsDialog.colorSettings.leatherColor}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.colorSettings.leatherColor}>
          <ColorInput
            colors={leatherColorValues}
            issue={issues.colorSettings.leatherColor}
            onChange={handleLeatherColorChange}
            value={editable.colorSettings.leatherColor}
          />
        </SectionGroup.SectionRowEditor>

        <SectionGroup.SectionRowTitle>
          {t.projects.settingsDialog.colorSettings.strokeColor}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.colorSettings.strokeColor}>
          <ColorInput
            colors={strokeColorValues}
            issue={issues.colorSettings.strokeColor}
            onChange={handleStrokeColorChange}
            value={editable.colorSettings.strokeColor}
          />
        </SectionGroup.SectionRowEditor>

        <SectionGroup.SectionRowTitle>{t.projects.settingsDialog.colorSettings.cardColor}</SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.colorSettings.cardColor}>
          <ColorInput
            colors={cardColorValues}
            issue={issues.colorSettings.cardColor}
            onChange={handleCardColorChange}
            value={editable.colorSettings.cardColor}
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>

      {/* Stitching */}
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>
          {t.projects.settingsDialog.colorSettings.stitchingTitle}
        </SectionGroup.SectionHeader>

        <SectionGroup.SectionRowTitle>
          {t.projects.settingsDialog.colorSettings.stitchHoleColor}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.colorSettings.stitchHoleColor}>
          <ColorInput
            colors={stitchHoleColorValues}
            issue={issues.colorSettings.stitchHoleColor}
            onChange={handleStitchHoleColorChange}
            value={editable.colorSettings.stitchHoleColor}
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle>
          {t.projects.settingsDialog.colorSettings.stitchLineColor}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.colorSettings.stitchLineColor}>
          <ColorInput
            colors={stitchLineColorValues}
            issue={issues.colorSettings.stitchLineColor}
            onChange={handleStitchLineColorChange}
            value={editable.colorSettings.stitchLineColor}
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle>
          {t.projects.settingsDialog.colorSettings.threadColor}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.colorSettings.threadColor}>
          <ColorInput
            colors={threadColorValues}
            issue={issues.colorSettings.threadColor}
            onChange={handleThreadColorChange}
            value={editable.colorSettings.threadColor}
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>

      {/* Selection */}
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>
          {t.projects.settingsDialog.colorSettings.selectionTitle}
        </SectionGroup.SectionHeader>

        <SectionGroup.SectionRowTitle>
          {t.projects.settingsDialog.colorSettings.selectionColor}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.colorSettings.selectionColor}>
          <ColorInput
            colors={selectionColorValues}
            issue={issues.colorSettings.selectionColor}
            onChange={handleSelectionColorChange}
            value={editable.colorSettings.selectionColor}
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
    </>
  )
}
