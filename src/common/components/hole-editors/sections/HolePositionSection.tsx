import { useCallback, type ReactNode } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { AnchorSchema, HasXYOffsetSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { HasAnchorsSchema } from '../../../schemas/hole'
import type { IssuesSchema } from '../../../schemas/issues'
import { AnchorSelect } from '../../common/AnchorSelect'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type HolePositionSectionProps<T> = {
  modelId: string
  editable: EditableSchema<T>
  issues: IssuesSchema<T>
  onChange: (updated: EditableSchema<T>) => void
}

export function HolePositionSection<T extends HasAnchorsSchema & HasXYOffsetSchema>({
  modelId,
  editable,
  issues,
  onChange,
}: HolePositionSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const handleXAnchorChange = useCallback(
    (xAnchor: AnchorSchema): void => {
      onChange({ ...editable, xAnchor })
    },
    [editable, onChange],
  )
  const handleYAnchorChange = useCallback(
    (yAnchor: AnchorSchema): void => {
      onChange({ ...editable, yAnchor })
    },
    [editable, onChange],
  )
  const handleXOffsetChange = useCallback(
    (xOffset: string): void => {
      onChange({ ...editable, xOffset })
    },
    [editable, onChange],
  )
  const handleYOffsetChange = useCallback(
    (yOffset: string): void => {
      onChange({ ...editable, yOffset })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.holes.position.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.holes.position.xAnchor.tooltip}>
        {t.project.editors.sections.holes.position.xAnchor.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.xAnchor}>
        <AnchorSelect onChange={handleXAnchorChange} value={editable.xAnchor} orientation="horizontal" />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.holes.position.xOffset.tooltip}>
        {t.project.editors.sections.holes.position.xOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.xOffset}>
        <EditorNumberInput
          modelId={modelId}
          field="xOffset"
          issue={issues.xOffset}
          onChange={handleXOffsetChange}
          unit="mm"
          value={editable.xOffset}
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.holes.position.yAnchor.tooltip}>
        {t.project.editors.sections.holes.position.yAnchor.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.yAnchor}>
        <AnchorSelect onChange={handleYAnchorChange} value={editable.yAnchor} orientation="vertical" />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.holes.position.yOffset.tooltip}>
        {t.project.editors.sections.holes.position.yOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.yOffset}>
        <EditorNumberInput
          modelId={modelId}
          field="yOffset"
          issue={issues.yOffset}
          onChange={handleYOffsetChange}
          unit="mm"
          value={editable.yOffset}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
