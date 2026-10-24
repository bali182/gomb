import {
  Combobox,
  HStack,
  IconButton,
  InputGroup,
  Portal,
  Text,
  createListCollection,
  useFilter,
  type ComboboxValueChangeDetails,
  type ListCollection,
} from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { PiArrowCounterClockwise, PiCreditCard } from 'react-icons/pi'
import { cards } from '../../data/cards'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import type { IssueSchema } from '../../schemas/issues'
import type { CardSchema, CardSchemaId } from '../../schemas/valuables'
import { isDefined } from '../../utils/isDefined'

type CardComboboxProps = {
  value: CardSchemaId | undefined
  issue: IssueSchema | undefined
  onChange: (cardId: CardSchemaId) => void
  onReset?: () => void
  isResetEnabled: boolean
}

export const CardCombobox: FC<CardComboboxProps> = ({ isResetEnabled, issue, onChange, onReset, value }) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')
  const { contains } = useFilter({ sensitivity: 'base' })
  const isInvalid = isDefined(issue) && issue.severity === 'error'
  const collection = useMemo<ListCollection<CardSchema>>(
    () =>
      createListCollection<CardSchema>({
        itemToString: (item) => t.data.cards[item.id],
        itemToValue: (item) => item.id,
        items: cards.filter((card) => {
          const dimensions = t.formatters.dimensions(
            t.formatters.number.max2(Math.round(card.width)),
            t.formatters.number.max2(Math.round(card.height)),
          )
          return (
            contains(t.data.cards[card.id], searchValue) ||
            contains(card.id, searchValue) ||
            contains(dimensions, searchValue)
          )
        }),
      }),
    [contains, searchValue, t],
  )
  const handleValueChange = useCallback(
    (details: ComboboxValueChangeDetails<CardSchema>): void => {
      const card = details.items[0]
      if (isDefined(card)) onChange(card.id)
    },
    [onChange],
  )
  const handleInputValueChange = useCallback((details: Combobox.InputValueChangeDetails): void => {
    if (details.reason === 'input-change') setSearchValue(details.inputValue)
  }, [])
  const handleOpenChange = useCallback((details: Combobox.OpenChangeDetails): void => {
    if (!details.open) setSearchValue('')
  }, [])
  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={handleInputValueChange}
      onOpenChange={handleOpenChange}
      onValueChange={handleValueChange}
      openOnClick
      size="xs"
      value={isDefined(value) ? [value] : []}
      width="full"
    >
      <InputGroup
        startAddon={<PiCreditCard />}
        startAddonProps={{ px: '1.5' }}
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
        <Combobox.Control width="full">
          <Combobox.Input
            aria-invalid={isInvalid}
            borderLeftRadius="0"
            borderRightRadius="0"
            placeholder={t.project.editors.controls.cardCombobox.noCard}
          />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
      </InputGroup>
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>{t.project.editors.controls.cardCombobox.noMatchingValues}</Combobox.Empty>
            <Combobox.List>
              {collection.items.map((card) => (
                <Combobox.Item item={card} key={card.id}>
                  <PiCreditCard />
                  <Combobox.ItemText flex="1" minWidth="0">
                    <HStack justifyContent="space-between">
                      <Text whiteSpace="nowrap">
                        {t.data.cards[card.id]}
                        <Text as="span" display="block" color="fg.muted" fontSize="2xs">
                          {card.id}
                        </Text>
                      </Text>
                      <Text color="fg.muted" fontSize="2xs" textAlign="right" whiteSpace="nowrap" flexShrink="0">
                        {t.formatters.dimensions(
                          t.formatters.number.max2(Math.round(card.width)),
                          t.formatters.number.max2(Math.round(card.height)),
                        )}
                      </Text>
                    </HStack>
                  </Combobox.ItemText>
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
