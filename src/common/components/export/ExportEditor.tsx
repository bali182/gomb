import type { FC } from 'react'

import type { EditableSchema } from '../../schemas/editable'

import type { IssuesSchema } from '../../schemas/issues'
import type { ExportSettingsSchema } from '../../schemas/settings'
import { SectionGroup } from '../common/SectionGroup'
import { ExportContentSection } from './ExportContentSection'
import { ExportLayoutSection } from './ExportLayoutSection'
import { ExportPageSection } from './ExportPageSection'

type ExportEditorProps = {
  disabled: boolean
  editable: EditableSchema<ExportSettingsSchema>
  issues: IssuesSchema<ExportSettingsSchema>
  onChange: (updated: EditableSchema<ExportSettingsSchema>) => void
}

export const ExportEditor: FC<ExportEditorProps> = ({ editable, issues, onChange, disabled }) => {
  return (
    <SectionGroup.Root>
      <ExportPageSection editable={editable} issues={issues} onChange={onChange} disabled={disabled} />
      <ExportLayoutSection editable={editable} issues={issues} onChange={onChange} disabled={disabled} />
      <ExportContentSection editable={editable} issues={issues} onChange={onChange} disabled={disabled} />
    </SectionGroup.Root>
  )
}
