import { SegmentGroup } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { PiCaretDown, PiCaretLeft, PiCaretRight, PiCaretUp } from 'react-icons/pi'

import type { PocketClusterSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import type { CardSchemaId } from '../../../schemas/valuables'
import { useTranslation } from '../../../translations/translation'
import { isDefined } from '../../../utils/isDefined'
import { CardPicker } from '../../common/CardPicker'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type PocketsSectionProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: ValidationIssuesSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
}

export const PocketsSection: FC<PocketsSectionProps> = ({ editable, issues, onChange }) => {
  const t = useTranslation()
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

  const handlePocketCountChange = useCallback(
    (pocketCount: string) => {
      onChange({
        ...editable,
        pocketCount,
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

  const handleTPocketTabWidthChange = useCallback(
    (tPocketTabWidth: string) => {
      onChange({
        ...editable,
        tPocketTabWidth,
      })
    },
    [editable, onChange],
  )

  const handleTPocketTaperChange = useCallback(
    (tPocketTaper: string) => {
      onChange({
        ...editable,
        tPocketTaper,
      })
    },
    [editable, onChange],
  )

  const handleCardIdChange = useCallback(
    (cardId: CardSchemaId): void => {
      onChange({
        ...editable,
        cardId,
      })
    },
    [editable, onChange],
  )
  const handleCardIdReset = useCallback((): void => {
    onChange({
      ...editable,
      cardId: undefined,
    })
  }, [editable, onChange])

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.component.editor.pocketCluster.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle>{t.component.editor.pocketCluster.opening}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.orientation}>
        <SegmentGroup.Root onValueChange={handleOrientationChange} size="sm" value={editable.orientation}>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item aria-label={t.component.editor.pocketCluster.fromTop} value="up">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretDown />
          </SegmentGroup.Item>
          <SegmentGroup.Item aria-label={t.component.editor.pocketCluster.fromBottom} value="down">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretUp />
          </SegmentGroup.Item>
          <SegmentGroup.Item aria-label={t.component.editor.pocketCluster.fromLeft} value="left">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretRight />
          </SegmentGroup.Item>
          <SegmentGroup.Item aria-label={t.component.editor.pocketCluster.fromRight} value="right">
            <SegmentGroup.ItemHiddenInput />
            <PiCaretLeft />
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.common.labels.amount}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketCount}>
        <NumberInput
          issue={issues.pocketCount}
          onChange={handlePocketCountChange}
          step={1}
          unit="db"
          value={editable.pocketCount}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.common.labels.spacing}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.pocketStep}>
        <NumberInput
          issue={issues.pocketStep}
          onChange={handlePocketStepChange}
          unit="mm"
          value={editable.pocketStep}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.component.editor.pocketCluster.flapWidth}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.tPocketTabWidth}>
        <NumberInput
          issue={issues.tPocketTabWidth}
          onChange={handleTPocketTabWidthChange}
          unit="mm"
          value={editable.tPocketTabWidth}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.component.editor.pocketCluster.taper}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.tPocketTaper}>
        <NumberInput
          issue={issues.tPocketTaper}
          onChange={handleTPocketTaperChange}
          unit="mm"
          value={editable.tPocketTaper}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle>{t.component.editor.pocketCluster.card}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.cardId}>
        <CardPicker
          isResetEnabled={isDefined(editable.cardId)}
          issue={issues.cardId}
          onChange={handleCardIdChange}
          onReset={handleCardIdReset}
          value={editable.cardId}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
