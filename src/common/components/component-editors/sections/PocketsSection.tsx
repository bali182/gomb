import { useCallback, type FC } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketClusterSchema, PocketOrientationSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { EditorNumberInput } from '../../common/EditorNumberInput'
import { PocketOrientationSelect } from '../../common/PocketOrientationSelect'
import { SectionGroup } from '../../common/SectionGroup'

type PocketsSectionProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: IssuesSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
}

export const PocketsSection: FC<PocketsSectionProps> = ({ editable, issues, onChange }) => {
  const { t } = useTranslation()
  const handleOrientationChange = useCallback(
    (orientation: PocketOrientationSchema) => {
      onChange({ ...editable, orientation })
    },
    [editable, onChange],
  )

  const handlePocketStepChange = useCallback(
    (pocketStep: string) => {
      onChange({
        ...editable,
        pocketStep,
      })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.components.pockets.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pockets.orientation.tooltip}>
        {t.project.editors.sections.components.pockets.orientation.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.orientation}>
        <PocketOrientationSelect onChange={handleOrientationChange} value={editable.orientation} />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pockets.pocketStep.tooltip}>
        {t.project.editors.sections.components.pockets.pocketStep.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketStep}>
        <EditorNumberInput
          modelId={editable.id}
          field="pocketStep"
          issue={issues.pocketStep}
          onChange={handlePocketStepChange}
          unit="mm"
          value={editable.pocketStep}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
