import {
  HStack,
  IconButton,
  InputGroup,
  Select,
  Text,
  createListCollection,
  type SelectValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { PiArrowCounterClockwise, PiCreditCard } from 'react-icons/pi'

import { cards, landscapeCards, portraitCards } from '../../data/cards'
import { useTranslation2 } from '../../hooks/useTranslation2'
import type { IssueSchema } from '../../schemas/validation'
import type { CardSchema, CardSchemaId } from '../../schemas/valuables'
import { isDefined } from '../../utils/isDefined'

const cardCollection = createListCollection<CardSchema>({
  itemToString: (item) => item.id,
  itemToValue: (item) => item.id,
  items: cards,
})

type CardPickerProps = {
  value: CardSchemaId | undefined
  issue: IssueSchema | undefined
  onChange: (cardId: CardSchemaId) => void
  onReset?: () => void
  isResetEnabled: boolean
}

export const CardPicker: FC<CardPickerProps> = ({ isResetEnabled, issue, onChange, onReset, value }) => {
  const { t } = useTranslation2()
  const isInvalid = isDefined(issue) && issue.severity === 'error'
  const isValuePortrait = portraitCards.some((c) => c.id === value)

  const handleValueChange = useCallback(
    (details: SelectValueChangeDetails<CardSchema>): void => {
      onChange(details.items[0].id)
    },
    [onChange],
  )

  return (
    <Select.Root
      aria-invalid={isInvalid}
      collection={cardCollection}
      onValueChange={handleValueChange}
      size="xs"
      value={isDefined(value) ? [value] : []}
      width="full"
    >
      <InputGroup
        endAddon={
          isDefined(onReset) ? (
            <IconButton
              alignSelf="stretch"
              borderRadius="0"
              disabled={!isResetEnabled}
              height="auto"
              onClick={onReset}
              size="xs"
              variant="plain"
            >
              <PiArrowCounterClockwise />
            </IconButton>
          ) : undefined
        }
        endAddonProps={{ px: 0, size: 'xs' }}
        width="full"
      >
        <Select.Control width="full">
          <Select.HiddenSelect />
          <Select.Trigger borderRightRadius="0">
            {isDefined(value) ? (
              <Select.ValueText asChild>
                <HStack>
                  <PiCreditCard style={isValuePortrait ? { transform: `rotate(90deg)` } : undefined} />
                  <span>{t.data.cards[value]}</span>
                </HStack>
              </Select.ValueText>
            ) : (
              <Select.ValueText placeholder={t.project.editors.controls.cardPicker.noCard} />
            )}
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
      </InputGroup>
      <Select.Positioner>
        <Select.Content>
          <Select.ItemGroup key="landscape">
            <Select.ItemGroupLabel>{t.project.editors.controls.cardPicker.landscape}</Select.ItemGroupLabel>
            <CardItems cards={landscapeCards} />
          </Select.ItemGroup>
          <Select.ItemGroup key="portrait">
            <Select.ItemGroupLabel>{t.project.editors.controls.cardPicker.portrait}</Select.ItemGroupLabel>
            <CardItems cards={portraitCards} transform="rotate(90deg)" />
          </Select.ItemGroup>
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  )
}

type CardItemsProps = {
  cards: CardSchema[]
  transform?: string
}

const CardItems: FC<CardItemsProps> = ({ cards, transform }) => {
  const { t } = useTranslation2()

  return (
    <>
      {cards.map((card) => {
        return (
          <Select.Item item={card} key={card.id}>
            <HStack>
              <PiCreditCard style={{ transform }} />
              <Text>{t.data.cardsSimple[card.id]}</Text>
              <Text color="fg.muted">({t.formatters.dimensions(card.width.toString(), card.height.toString())})</Text>
            </HStack>
            <Select.ItemIndicator />
          </Select.Item>
        )
      })}
    </>
  )
}
