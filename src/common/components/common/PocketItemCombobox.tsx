import {
  Combobox,
  HStack,
  Icon,
  IconButton,
  InputGroup,
  Portal,
  Text,
  VStack,
  createListCollection,
  useFilter,
  type ComboboxValueChangeDetails,
  type ListCollection,
} from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import type { IconType } from 'react-icons'
import { PiArrowCounterClockwise, PiCreditCard, PiMoney, PiRectangle } from 'react-icons/pi'

import { pocketItems } from '../../data/pocketItems'
import { usePocketItems } from '../../hooks/usePocketItems'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import type { IssueSchema } from '../../schemas/issues'
import type { PocketItemIdSchema, PocketItemSchema, TranslatedPocketItemSchema } from '../../schemas/pocketItem'
import { isDefined } from '../../utils/isDefined'

type PocketItemComboboxProps = {
  value: PocketItemIdSchema | undefined
  issue: IssueSchema | undefined
  onChange: (itemId: PocketItemIdSchema) => void
  onReset?: () => void
  isResetEnabled: boolean
}

const itemIcons: Record<PocketItemSchema['type'], IconType> = {
  card: PiCreditCard,
  banknote: PiMoney,
}

export const PocketItemCombobox: FC<PocketItemComboboxProps> = ({
  isResetEnabled,
  issue,
  onChange,
  onReset,
  value,
}) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')
  const { contains } = useFilter({ sensitivity: 'base' })
  const isInvalid = isDefined(issue) && issue.severity === 'error'
  const selectedItem = isDefined(value) ? pocketItems[value] : undefined
  const selectedIcon = isDefined(selectedItem) ? itemIcons[selectedItem.type] : PiRectangle

  const filter = useCallback(
    (item: TranslatedPocketItemSchema): boolean => {
      const dimensions = t.formatters.dimensions(
        t.formatters.number.max2(Math.round(item.width)),
        t.formatters.number.max2(Math.round(item.height)),
      )
      return contains(item.name, searchValue) || contains(item.id, searchValue) || contains(dimensions, searchValue)
    },
    [contains, searchValue, t],
  )
  const { filteredGroups } = usePocketItems(filter)

  const collection = useMemo<ListCollection<TranslatedPocketItemSchema>>(
    () =>
      createListCollection<TranslatedPocketItemSchema>({
        itemToString: (item) => item.name,
        itemToValue: (item) => item.id,
        items: filteredGroups.flatMap((group) => group.items),
      }),
    [filteredGroups],
  )

  const handleValueChange = useCallback(
    (details: ComboboxValueChangeDetails<TranslatedPocketItemSchema>): void => {
      const item = details.items[0]
      if (isDefined(item)) {
        onChange(item.id)
      }
    },
    [onChange],
  )
  const handleInputValueChange = useCallback((details: Combobox.InputValueChangeDetails): void => {
    if (details.reason === 'input-change') {
      setSearchValue(details.inputValue)
    }
  }, [])
  const handleOpenChange = useCallback((details: Combobox.OpenChangeDetails): void => {
    if (!details.open) {
      setSearchValue('')
    }
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
        startAddon={<Icon as={selectedIcon} />}
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
            placeholder={t.project.editors.controls.pocketItemCombobox.noItem}
          />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
      </InputGroup>
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>{t.project.editors.controls.pocketItemCombobox.noMatchingValues}</Combobox.Empty>
            <Combobox.List>
              {filteredGroups.map((group) => (
                <Combobox.ItemGroup key={group.id}>
                  <Combobox.ItemGroupLabel>{group.name}</Combobox.ItemGroupLabel>
                  {group.items.map((item) => (
                    <Combobox.Item item={item} key={item.id}>
                      <Icon as={itemIcons[item.type]} flexShrink="0" />
                      <VStack flex="1" minWidth="0" align="stretch" gap="0">
                        <HStack justifyContent="space-between" gap="2" minWidth="0">
                          <Combobox.ItemText flex="1" minWidth="0" truncate>
                            {item.name}
                          </Combobox.ItemText>
                          <Combobox.ItemIndicator flexShrink="0" />
                        </HStack>
                        <HStack justifyContent="space-between" gap="2">
                          <Text color="fg.muted" fontSize="2xs" whiteSpace="nowrap">
                            {item.id}
                          </Text>
                          <Text color="fg.muted" fontSize="2xs" textAlign="right" whiteSpace="nowrap" flexShrink="0">
                            {t.formatters.dimensions(
                              t.formatters.number.max2(Math.round(item.width)),
                              t.formatters.number.max2(Math.round(item.height)),
                            )}
                          </Text>
                        </HStack>
                      </VStack>
                    </Combobox.Item>
                  ))}
                </Combobox.ItemGroup>
              ))}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
