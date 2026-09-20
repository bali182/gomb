import { useCallback, type ReactNode } from 'react'

import type { HasSizeSchema } from '../../../schemas/common'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { useTranslation } from '../../../translations/translation'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type SizeSectionProps<T> = {
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<HasSizeSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function SizeSection<T extends HasSizeSchema>({ editable, issues, onChange }: SizeSectionProps<T>): ReactNode {
  const t = useTranslation()
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
      <SectionGroup.SectionHeader>{t.common.labels.size}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle>{t.common.labels.width}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.width}>
        <NumberInput issue={issues.width} onChange={handleWidthChange} unit="mm" value={editable.width} />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.common.labels.height}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.height}>
        <NumberInput issue={issues.height} onChange={handleHeightChange} unit="mm" value={editable.height} />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
