import { useCallback, type FC } from 'react'

import { useTranslation } from '../../hooks/useTranslation'
import type { PocketSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type { PocketOpeningSideSchema, SlantedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { isDefined } from '../../utils/isDefined'
import { EditorNumberInput } from '../common/EditorNumberInput'
import { PocketOpeningSideSelect } from '../common/PocketOpeningSideSelect'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningEditorPreview } from './PocketOpeningEditorPreview'

type SlantedPocketOpeningEditorProps = {
  opening: SlantedPocketOpeningSchema
  referencePocket: PocketSchema | undefined
  editable: EditableSchema<SlantedPocketOpeningSchema>
  issues: IssuesSchema<SlantedPocketOpeningSchema>
  onChange: (updated: EditableSchema<SlantedPocketOpeningSchema>) => void
}

export const SlantedPocketOpeningEditor: FC<SlantedPocketOpeningEditorProps> = ({
  opening,
  referencePocket,
  editable,
  issues,
  onChange,
}) => {
  const { t } = useTranslation()

  const handleOffsetChange = useCallback(
    (offset: string): void => {
      onChange({ ...editable, offset })
    },
    [editable, onChange],
  )

  const handleSideChange = useCallback(
    (side: PocketOpeningSideSchema): void => {
      onChange({ ...editable, side })
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
          tooltip={t.project.editors.sections.components.slantedPocketOpening.geometry.side.tooltip}
        >
          {t.project.editors.sections.components.slantedPocketOpening.geometry.side.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.side}>
          <PocketOpeningSideSelect value={editable.side} issue={issues.side} onChange={handleSideChange} />
        </SectionGroup.SectionRowEditor>
        <SectionGroup.SectionRowTitle
          tooltip={t.project.editors.sections.components.slantedPocketOpening.geometry.offset.tooltip}
        >
          {t.project.editors.sections.components.slantedPocketOpening.geometry.offset.label}
        </SectionGroup.SectionRowTitle>
        <SectionGroup.SectionRowEditor issue={issues.offset}>
          <EditorNumberInput
            modelId={editable.id}
            field="offset"
            value={editable.offset}
            issue={issues.offset}
            onChange={handleOffsetChange}
            unit="mm"
          />
        </SectionGroup.SectionRowEditor>
      </SectionGroup.Section>
    </SectionGroup.Root>
  )
}
