import { useCallback, type FC } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketClusterSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import type { CardSchemaId } from '../../../schemas/valuables'
import { isDefined } from '../../../utils/isDefined'
import { CardPicker } from '../../common/CardPicker'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type CardsSectionProps = {
  editable: EditableSchema<PocketClusterSchema>
  issues: ValidationIssuesSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
}

export const CardsSection: FC<CardsSectionProps> = ({ editable, issues, onChange }) => {
  const { t } = useTranslation()
  const hasCard = isDefined(editable.cardId)

  const handleCardIdChange = useCallback(
    (cardId: CardSchemaId): void => {
      onChange({ ...editable, cardId })
    },
    [editable, onChange],
  )

  const handleCardIdReset = useCallback((): void => {
    onChange({
      ...editable,
      cardId: undefined,
      cardCrossAxisOffset: '0',
      cardOpeningOffset: '0',
    })
  }, [editable, onChange])

  const handleCardCrossAxisOffsetChange = useCallback(
    (cardCrossAxisOffset: string): void => {
      onChange({ ...editable, cardCrossAxisOffset })
    },
    [editable, onChange],
  )

  const handleCardOpeningOffsetChange = useCallback(
    (cardOpeningOffset: string): void => {
      onChange({ ...editable, cardOpeningOffset })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.components.cards.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.cards.cardId.tooltip}>
        {t.project.editors.sections.components.cards.cardId.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.cardId}>
        <CardPicker
          isResetEnabled={hasCard}
          issue={issues.cardId}
          onChange={handleCardIdChange}
          onReset={handleCardIdReset}
          value={editable.cardId}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.cards.cardCrossAxisOffset.tooltip}>
        {t.project.editors.sections.components.cards.cardCrossAxisOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.cardCrossAxisOffset}>
        <NumberInput
          disabled={!hasCard}
          issue={issues.cardCrossAxisOffset}
          onChange={handleCardCrossAxisOffsetChange}
          unit="mm"
          value={editable.cardCrossAxisOffset}
        />
      </SectionGroup.SectionRowEditor>

      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.cards.cardOpeningOffset.tooltip}>
        {t.project.editors.sections.components.cards.cardOpeningOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.cardOpeningOffset}>
        <NumberInput
          disabled={!hasCard}
          issue={issues.cardOpeningOffset}
          onChange={handleCardOpeningOffsetChange}
          unit="mm"
          value={editable.cardOpeningOffset}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
