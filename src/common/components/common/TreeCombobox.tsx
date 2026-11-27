import {
  Box,
  Combobox,
  HStack,
  Icon,
  Portal,
  createListCollection,
  useCombobox,
  useFilter,
  type ComboboxInputValueChangeDetails,
  type ComboboxOpenChangeDetails,
  type ComboboxValueChangeDetails,
  type ListCollection,
  type SystemStyleObject,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { portalRef } from '../../portalRefs'
import { isDefined } from '../../utils/isDefined'

export type TreeComboboxItem = {
  id: string
  label: string
  icon: IconType
  depth: number
  disabled: boolean
  groupId?: string
}

export type TreeComboboxGroup = { id: string; label: string }
export type TreeComboboxIds = { input: string; control: string }

type TreeComboboxProps = {
  items: TreeComboboxItem[]
  groups?: TreeComboboxGroup[]
  value: string[]
  inputValue: string
  open: boolean
  readOnly: boolean
  ids?: TreeComboboxIds
  control: ReactNode
  emptyMessage: string
  onSelect: (id: string) => void
  onInputValueChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onExitComplete?: () => void
}

const disabledStyles: SystemStyleObject = { opacity: 1 }

export const TreeCombobox: FC<TreeComboboxProps> = ({
  items,
  groups,
  value,
  inputValue,
  open,
  readOnly,
  ids,
  control,
  emptyMessage,
  onSelect,
  onInputValueChange,
  onOpenChange,
  onExitComplete,
}) => {
  const { contains } = useFilter({ sensitivity: 'base' })
  const searching = inputValue.trim().length > 0
  const collection = useMemo<ListCollection<TreeComboboxItem>>(
    () =>
      createListCollection({
        items: items.filter((item) => contains(item.label, inputValue.trim())),
        itemToString: (item) => item.label,
        itemToValue: (item) => item.id,
        isItemDisabled: (item) => item.disabled,
      }),
    [items, inputValue, contains],
  )
  const combobox = useCombobox<TreeComboboxItem>({
    ids,
    collection,
    value,
    inputValue,
    open,
    readOnly,
    inputBehavior: searching ? 'autohighlight' : 'none',
    openOnClick: true,
    closeOnSelect: false,
    onValueChange: (details: ComboboxValueChangeDetails<TreeComboboxItem>): void => {
      const item = details.items[0]
      if (!readOnly && isDefined(item) && !item.disabled) {
        onSelect(item.id)
      }
    },
    onInputValueChange: (details: ComboboxInputValueChangeDetails): void => {
      if (details.reason === 'input-change') {
        onInputValueChange(details.inputValue)
      }
    },
    onOpenChange: (details: ComboboxOpenChangeDetails): void => onOpenChange(details.open),
  })
  const renderItem = useCallback(
    (item: TreeComboboxItem): ReactNode => (
      <Combobox.Item
        key={item.id}
        item={item}
        position="relative"
        ps={`calc({spacing.2} + ${searching ? 0 : item.depth} * {spacing.4})`}
        _disabled={disabledStyles}
      >
        {!searching &&
          Array.from(
            { length: item.depth },
            (_, depth: number): ReactNode => (
              <Box
                key={depth}
                position="absolute"
                top="0"
                bottom="0"
                insetInlineStart={`calc({spacing.2} + ${depth} * {spacing.4} + {spacing.4} / 2)`}
                borderInlineStartWidth="1px"
                borderColor="border"
                pointerEvents="none"
              />
            ),
          )}
        <HStack gap="2" minW="0" flex="1" color={item.disabled ? 'fg.muted' : undefined}>
          <Icon as={item.icon} flexShrink="0" />
          <Combobox.ItemText>{item.label}</Combobox.ItemText>
        </HStack>
        <Combobox.ItemIndicator />
      </Combobox.Item>
    ),
    [searching],
  )

  return (
    <Combobox.RootProvider value={combobox} size="xs" onExitComplete={onExitComplete}>
      {control}
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content maxH="72" overflowY="auto">
            <Combobox.Empty>{emptyMessage}</Combobox.Empty>
            <Combobox.List>
              {isDefined(groups)
                ? groups.map((group) => {
                    const groupItems = collection.items.filter((item) => item.groupId === group.id)
                    return (
                      groupItems.length > 0 && (
                        <Combobox.ItemGroup key={group.id}>
                          <Combobox.ItemGroupLabel>{group.label}</Combobox.ItemGroupLabel>
                          {groupItems.map(renderItem)}
                        </Combobox.ItemGroup>
                      )
                    )
                  })
                : collection.items.map(renderItem)}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.RootProvider>
  )
}
