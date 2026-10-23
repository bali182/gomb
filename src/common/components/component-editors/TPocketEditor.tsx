import { useCallback, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { PocketClusterSchema, PocketOpeningSchema, TPocketSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { NumberInput } from '../common/NumberInput'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningFields } from './sections/PocketOpeningFields'
type TPocketEditorProps = {
  component: TPocketSchema
  editable: EditableSchema<TPocketSchema>
  issues: IssuesSchema<TPocketSchema>
  parent: PocketClusterSchema
  onChange: (value: EditableSchema<TPocketSchema>) => void
}
export const TPocketEditor: FC<TPocketEditorProps> = ({ component, editable, issues, parent, onChange }) => {
  const { t } = useTranslation()
  const handleOpeningChange = useCallback(
    (opening: EditableSchema<PocketOpeningSchema>): void => onChange({ ...editable, opening }),
    [editable, onChange],
  )
  const handleTabWidthChange = useCallback(
    (tPocketTabWidth: string): void => onChange({ ...editable, tPocketTabWidth }),
    [editable, onChange],
  )
  const handleTaperChange = useCallback(
    (tPocketTaper: string): void => onChange({ ...editable, tPocketTaper }),
    [editable, onChange],
  )
  return (
    <SectionGroup.Root>
      <PocketOpeningFields
        pocket={component}
        cluster={parent}
        editable={editable.opening}
        issues={issues.opening}
        onChange={handleOpeningChange}
      />
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>{t.project.editors.sections.components.tPocket.title}</SectionGroup.SectionHeader>
        <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.tPocket.tPocketTabWidth.tooltip}>
          {t.project.editors.sections.components.tPocket.tPocketTabWidth.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.tPocketTabWidth}>
          <NumberInput
            unit="mm"
            value={editable.tPocketTabWidth}
            issue={issues.tPocketTabWidth}
            onChange={handleTabWidthChange}
          />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.tPocket.tPocketTaper.tooltip}>
          {t.project.editors.sections.components.tPocket.tPocketTaper.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.tPocketTaper}>
          <NumberInput
            unit="mm"
            value={editable.tPocketTaper}
            issue={issues.tPocketTaper}
            onChange={handleTaperChange}
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
    </SectionGroup.Root>
  )
}
