import type { FC } from 'react'

import type { EditableSchema } from '../../schemas/editable'

import type { ExportSettingsSchema } from '../../schemas/settings'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { SectionGroup } from '../common/SectionGroup'
import { ExportContentSection } from './ExportContentSection'
import { ExportLayoutSection } from './ExportLayoutSection'
import { ExportPageSection } from './ExportPageSection'

type ExportEditorProps = {
  editable: EditableSchema<ExportSettingsSchema>
  issues: ValidationIssuesSchema<ExportSettingsSchema>
  onChange: (updated: EditableSchema<ExportSettingsSchema>) => void
}

export const ExportEditor: FC<ExportEditorProps> = ({ editable, issues, onChange }) => {
  return (
    <SectionGroup.Root>
      <ExportPageSection editable={editable} issues={issues} onChange={onChange} />
      <ExportLayoutSection editable={editable} issues={issues} onChange={onChange} />
      <ExportContentSection editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Root>
  )
}
