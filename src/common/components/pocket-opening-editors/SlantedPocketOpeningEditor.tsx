import { useCallback, type FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { usePocketOpeningEditorReference } from '../../hooks/usePocketOpeningEditorReference'
import { usePocketOpeningLimitIssues } from '../../hooks/usePocketOpeningLimitIssues'

import { useTranslation } from '../../hooks/useTranslation'
import type { IssuesSchema } from '../../schemas/issues'
import type { PocketOpeningSideSchema, SlantedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { isDefined } from '../../utils/isDefined'
import { EditorNumberInput } from '../common/EditorNumberInput'
import { PocketOpeningSideSelect } from '../common/PocketOpeningSideSelect'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningEditorPreview } from './PocketOpeningEditorPreview'

export const SlantedPocketOpeningEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<SlantedPocketOpeningSchema>()

  const opening = models[selectedModelId]
  const { pocket: referencePocket } = usePocketOpeningEditorReference(selectedModelId)
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]

  const limitIssues = usePocketOpeningLimitIssues(opening, referencePocket)
  const issues = useCombinedIssues<SlantedPocketOpeningSchema>(
    validationIssues[selectedModelId],
    limitIssues as IssuesSchema<SlantedPocketOpeningSchema>,
  )
  const { t } = useTranslation()

  const handleOffsetChange = useCallback(
    (offset: string): void => {
      onChange({ ...editable, slantOffset: offset })
    },
    [editable, onChange],
  )

  const handleSideChange = useCallback(
    (side: PocketOpeningSideSchema): void => {
      onChange({ ...editable, slantSide: side })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Root>
      {!isDefined(referencePocket) && <PocketOpeningEditorPreview opening={opening} />}
      <SectionGroup.Section>
        <SectionGroup.SectionHeader>
          {t.project.editors.sections.components.slantedPocketOpening.geometry.title}
        </SectionGroup.SectionHeader>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.slantedPocketOpening.geometry.slantSide.tooltip}
        >
          {t.project.editors.sections.components.slantedPocketOpening.geometry.slantSide.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.slantSide}>
          <PocketOpeningSideSelect value={editable.slantSide} issue={issues.slantSide} onChange={handleSideChange} />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.slantedPocketOpening.geometry.slantOffset.tooltip}
        >
          {t.project.editors.sections.components.slantedPocketOpening.geometry.slantOffset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.slantOffset}>
          <EditorNumberInput
            modelId={editable.id}
            field="offset"
            value={editable.slantOffset}
            issue={issues.slantOffset}
            onChange={handleOffsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
    </SectionGroup.Root>
  )
}
