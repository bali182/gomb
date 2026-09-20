import { Switch } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'
import { PiArrowLeft, PiArrowRight } from 'react-icons/pi'

import type { EditableSchema } from '../../../schemas/editable'
import type { PocketClusterStitchLineSchema } from '../../../schemas/stitching'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { useTranslation } from '../../../translations/translation'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type PocketStitchingSectionProps = {
  editable: EditableSchema<PocketClusterStitchLineSchema>
  issues: ValidationIssuesSchema<PocketClusterStitchLineSchema>
  onChange: (updated: EditableSchema<PocketClusterStitchLineSchema>) => void
}

export const PocketStitchingSection = ({ editable, issues, onChange }: PocketStitchingSectionProps): ReactNode => {
  const t = useTranslation()
  const handleStartOffsetChange = useCallback(
    (startOffset: string): void => {
      onChange({ ...editable, startOffset })
    },
    [editable, onChange],
  )
  const handleEndOffsetChange = useCallback(
    (endOffset: string): void => {
      onChange({ ...editable, endOffset })
    },
    [editable, onChange],
  )
  const handleStitchDirectionChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onChange({ ...editable, stitchDirection: details.checked ? 'start-to-end' : 'end-to-start' })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.stitchLine.editor.pocketStitch.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle>{t.stitchLine.editor.pocketStitch.startOffset}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.startOffset}>
        <NumberInput
          issue={issues.startOffset}
          onChange={handleStartOffsetChange}
          unit="mm"
          value={editable.startOffset}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.stitchLine.editor.pocketStitch.endOffset}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.endOffset}>
        <NumberInput issue={issues.endOffset} onChange={handleEndOffsetChange} unit="mm" value={editable.endOffset} />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.common.labels.direction}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.stitchDirection}>
        <Switch.Root
          checked={editable.stitchDirection === 'start-to-end'}
          onCheckedChange={handleStitchDirectionChange}
          size="md"
        >
          <Switch.HiddenInput />
          <Switch.Control bg="bg.emphasized" _checked={{ bg: 'bg.emphasized' }}>
            <Switch.Thumb bg="bg.panel" _checked={{ bg: 'bg.panel' }}>
              <Switch.ThumbIndicator fallback={<PiArrowLeft />}>
                <PiArrowRight />
              </Switch.ThumbIndicator>
            </Switch.Thumb>
          </Switch.Control>
        </Switch.Root>
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
