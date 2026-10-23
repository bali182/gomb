import { SegmentGroup } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { PiCaretDown, PiCaretLeft, PiCaretRight, PiCaretUp } from 'react-icons/pi'

import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketClusterSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { NumberInput } from '../../common/NumberInput'
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
    (details: SegmentGroup.ValueChangeDetails) => {
      if (details.value !== 'up' && details.value !== 'down' && details.value !== 'left' && details.value !== 'right') {
        return
      }

      onChange({
        ...editable,
        orientation: details.value,
      })
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
        <SegmentGroup.Root onValueChange={handleOrientationChange} size="sm" value={editable.orientation}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="up">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretDown />
          </SegmentGroup.Item>
          <SegmentGroup.Item value="down">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretUp />
          </SegmentGroup.Item>
          <SegmentGroup.Item value="left">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretRight />
          </SegmentGroup.Item>
          <SegmentGroup.Item value="right">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretLeft />
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pockets.pocketStep.tooltip}>
        {t.project.editors.sections.components.pockets.pocketStep.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketStep}>
        <NumberInput
          issue={issues.pocketStep}
          onChange={handlePocketStepChange}
          unit="mm"
          value={editable.pocketStep}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
