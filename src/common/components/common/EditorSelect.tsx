import { createListCollection, Icon, ListCollection, Select, SelectRootProps } from '@chakra-ui/react'
import { ReactElement, useCallback, useMemo } from 'react'
import { IconType } from 'react-icons'
import { useTranslation } from '../../hooks/useTranslation'
import { IssueSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { EditorSelectWrapper } from './EditorSelectWrapper'

export type EditorSelectProps<T extends string> = {
  items: T[]
  value: T | null | undefined
  icons?: Record<T, IconType>
  labels: Record<T, string>
  issue?: IssueSchema
  disabled?: boolean
  placeholder?: string
  onChange: (value: T) => void
}

export const EditorSelect = <T extends string>({
  issue,
  items,
  value,
  labels,
  icons,
  disabled,
  placeholder,
  onChange,
}: EditorSelectProps<T>): ReactElement => {
  const { t } = useTranslation()
  const selectedValue = useMemo(() => (isDefined(value) ? [value] : []), [value])

  const collection = useMemo<ListCollection<T>>(
    () =>
      createListCollection<T>({
        items,
        itemToValue: (value) => value,
        itemToString: (value: T): string => labels[value],
      }),
    [items, labels],
  )

  const handleChange = useCallback(
    (details: Select.ValueChangeDetails<T>) => {
      const [value] = details.items
      if (isDefined(value)) {
        onChange(value)
      }
    },
    [onChange],
  )

  const SelectedIcon: IconType | undefined = isDefined(value) && isDefined(icons) ? icons[value] : undefined

  return (
    <EditorSelectWrapper
      collection={collection}
      value={selectedValue}
      positioning={positioning}
      onValueChange={handleChange}
      size="xs"
      width="full"
      minW="0"
      disabled={disabled}
      invalid={issue?.severity === 'error'}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger justifyContent="flex-start" gap="2">
          {isDefined(SelectedIcon) && (
            <Icon size="sm">
              <SelectedIcon />
            </Icon>
          )}
          <Select.ValueText placeholder={placeholder ?? t.project.editors.controls.selects.notApplicable} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Select.Positioner>
        <Select.Content width="full">
          {collection.items.map((value) => {
            const ItemIcon: IconType | undefined = icons?.[value]
            return (
              <Select.Item key={value} item={value}>
                {isDefined(ItemIcon) && (
                  <Icon size="sm">
                    <ItemIcon />
                  </Icon>
                )}
                <Select.ItemText>{labels[value]}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            )
          })}
        </Select.Content>
      </Select.Positioner>
    </EditorSelectWrapper>
  )
}

const positioning: SelectRootProps['positioning'] = {
  strategy: 'fixed',
  sameWidth: true,
}
