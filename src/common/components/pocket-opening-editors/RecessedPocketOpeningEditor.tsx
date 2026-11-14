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
      onChange({ ...editable, outerInset })
    },
    [editable, onChange],
  )

  const handleInnerOffsetChange = useCallback(
    (innerOffset: string): void => {
      onChange({ ...editable, innerOffset })
    },
    [editable, onChange],
  )

  const handleDepthChange = useCallback(
    (depth: string): void => {
      onChange({ ...editable, depth })
    },
    [editable, onChange],
  )

  const handleOuterRadiusChange = useCallback(
    (outerRadius: string): void => {
      onChange({ ...editable, outerRadius })
    },
    [editable, onChange],
  )

  const handleInnerRadiusChange = useCallback(
    (innerRadius: string): void => {
      onChange({ ...editable, innerRadius })
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
          tooltip={t.project.editors.sections.components.recessedPocketOpening.geometry.outerInset.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.geometry.outerInset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.outerInset}>
          <EditorNumberInput
            modelId={editable.id}
            field="outerInset"
            value={editable.outerInset}
            issue={issues.outerInset}
            onChange={handleOuterInsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.geometry.innerOffset.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.geometry.innerOffset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.innerOffset}>
          <EditorNumberInput
            modelId={editable.id}
            field="innerOffset"
            value={editable.innerOffset}
            issue={issues.innerOffset}
            onChange={handleInnerOffsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.geometry.depth.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.geometry.depth.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.depth}>
          <EditorNumberInput
            modelId={editable.id}
            field="depth"
            value={editable.depth}
            issue={issues.depth}
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
          tooltip={t.project.editors.sections.components.recessedPocketOpening.cornerRadius.outerRadius.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.cornerRadius.outerRadius.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.outerRadius}>
          <EditorNumberInput
            modelId={editable.id}
            field="outerRadius"
            value={editable.outerRadius}
            issue={issues.outerRadius}
            onChange={handleOuterRadiusChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.recessedPocketOpening.cornerRadius.innerRadius.tooltip}
        >
          {t.project.editors.sections.components.recessedPocketOpening.cornerRadius.innerRadius.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.innerRadius}>
          <EditorNumberInput
            modelId={editable.id}
            field="innerRadius"
            value={editable.innerRadius}
            issue={issues.innerRadius}
            onChange={handleInnerRadiusChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
    </SectionGroup.Root>
  )
}
