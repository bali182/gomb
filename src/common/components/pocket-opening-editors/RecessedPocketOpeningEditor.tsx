import { useCallback, type FC } from 'react'

import { useTranslation } from '../../hooks/useTranslation'
import type { PocketSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type { RecessedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { isDefined } from '../../utils/isDefined'
import { EditorNumberInput } from '../common/EditorNumberInput'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningEditorPreview } from './PocketOpeningEditorPreview'

type RecessedPocketOpeningEditorProps = {
  opening: RecessedPocketOpeningSchema
  referencePocket: PocketSchema | undefined
  editable: EditableSchema<RecessedPocketOpeningSchema>
  issues: IssuesSchema<RecessedPocketOpeningSchema>
  onChange: (updated: EditableSchema<RecessedPocketOpeningSchema>) => void
}

export const RecessedPocketOpeningEditor: FC<RecessedPocketOpeningEditorProps> = ({
  opening,
  referencePocket,
  editable,
  issues,
  onChange,
}) => {
  const { t } = useTranslation()

  const handleOuterInsetChange = useCallback(
    (outerInset: string): void => {
      onChange({ ...editable, recessOuterInset: outerInset })
    },
    [editable, onChange],
  )

  const handleInnerOffsetChange = useCallback(
    (innerOffset: string): void => {
      onChange({ ...editable, recessInnerOffset: innerOffset })
    },
    [editable, onChange],
  )

  const handleDepthChange = useCallback(
    (depth: string): void => {
      onChange({ ...editable, recessDepth: depth })
    },
    [editable, onChange],
  )

  const handleOuterRadiusChange = useCallback(
    (outerRadius: string): void => {
      onChange({ ...editable, recessOuterRadius: outerRadius })
    },
    [editable, onChange],
  )

  const handleInnerRadiusChange = useCallback(
    (innerRadius: string): void => {
      onChange({ ...editable, recessInnerRadius: innerRadius })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Root>
      {!isDefined(referencePocket) && <PocketOpeningEditorPreview opening={opening} />}
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>
          {t.project.editors.sections.components.recessedPocketOpening.geometry.title}
        </SectionGroup.SectionHeader>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.geometry.recessOuterInset.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.geometry.recessOuterInset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.recessOuterInset}>
          <EditorNumberInput
            modelId={editable.id}
            field="outerInset"
            value={editable.recessOuterInset}
            issue={issues.recessOuterInset}
            onChange={handleOuterInsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.geometry.recessInnerOffset.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.geometry.recessInnerOffset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.recessInnerOffset}>
          <EditorNumberInput
            modelId={editable.id}
            field="innerOffset"
            value={editable.recessInnerOffset}
            issue={issues.recessInnerOffset}
            onChange={handleInnerOffsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.geometry.recessDepth.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.geometry.recessDepth.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.recessDepth}>
          <EditorNumberInput
            modelId={editable.id}
            field="depth"
            value={editable.recessDepth}
            issue={issues.recessDepth}
            onChange={handleDepthChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>
          {t.project.editors.sections.components.recessedPocketOpening.cornerRadius.title}
        </SectionGroup.SectionHeader>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.cornerRadius.recessOuterRadius.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.cornerRadius.recessOuterRadius.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.recessOuterRadius}>
          <EditorNumberInput
            modelId={editable.id}
            field="outerRadius"
            value={editable.recessOuterRadius}
            issue={issues.recessOuterRadius}
            onChange={handleOuterRadiusChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.cornerRadius.recessInnerRadius.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.cornerRadius.recessInnerRadius.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.recessInnerRadius}>
          <EditorNumberInput
            modelId={editable.id}
            field="innerRadius"
            value={editable.recessInnerRadius}
            issue={issues.recessInnerRadius}
            onChange={handleInnerRadiusChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
    </SectionGroup.Root>
  )
}
