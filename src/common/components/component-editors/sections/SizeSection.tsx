import { useCallback, type ReactNode } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { HasSizeSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type SizeSectionProps<T> = {
  modelId: string
  editable: EditableSchema<T>
  issues: IssuesSchema<HasSizeSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function SizeSection<T extends HasSizeSchema>({
  modelId,
  editable,
  issues,
  onChange,
}: SizeSectionProps<T>): ReactNode {
  const { t } = useTranslation()
  const handleWidthChange = useCallback(
    (width: string) => {
      onChange({ ...editable, width })
    },
    [editable, onChange],
  )

  const handleHeightChange = useCallback(
    (height: string) => {
      onChange({ ...editable, height })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.common.size.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.common.size.width.tooltip}>
        {t.project.editors.sections.common.size.width.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.width}>
        <EditorNumberInput
          modelId={modelId}
          field="width"
          issue={issues.width}
          onChange={handleWidthChange}
          unit="mm"
          value={editable.width}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.common.size.height.tooltip}>
        {t.project.editors.sections.common.size.height.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.height}>
        <EditorNumberInput
          modelId={modelId}
          field="height"
          issue={issues.height}
          onChange={handleHeightChange}
          unit="mm"
          value={editable.height}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
