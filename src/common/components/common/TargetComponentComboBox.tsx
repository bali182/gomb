import {
  Combobox,
  HStack,
  InputGroup,
  Portal,
  createListCollection,
  type ComboboxValueChangeDetails,
  type ListCollection,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiArrowCounterClockwise, PiTarget } from 'react-icons/pi'

import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { portalRef } from '../../portalRef'
import type { ComponentSchema } from '../../schemas/components'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { EditorIconButton } from './EditorIconButton'

type TargetComponentComboBoxProps = {
  components: ComponentSchema[]
  selectedComponent: ComponentSchema
  onChange: (componentId: string) => void
  onReset?: () => void
  resetDisabled?: boolean
}

export const TargetComponentComboBox: FC<TargetComponentComboBoxProps> = ({
  components,
  selectedComponent,
  onChange,
  onReset,
  resetDisabled,
}) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const { subProject } = useSubProject()
  const collection = useMemo<ListCollection<ComponentSchema>>(
    () =>
      createListCollection<ComponentSchema>({
        itemToString: (component: ComponentSchema): string => component.name,
        itemToValue: (component: ComponentSchema): string => component.id,
        items: components,
      }),
    [components],
  )
  const selectedValue = useMemo<string[]>(() => [selectedComponent.id], [selectedComponent.id])
  const hasReset = isDefined(onReset)

  const handleValueChange = useCallback(
    (details: ComboboxValueChangeDetails<ComponentSchema>): void => {
      const componentId = details.value[0]

      if (isDefined(componentId)) {
        setEditingInputId(undefined)
        onChange(componentId)
      }
    },
    [onChange, setEditingInputId],
  )

  const handleReset = useCallback((): void => {
    setEditingInputId(undefined)
    onReset?.()
  }, [onReset, setEditingInputId])

  return (
    <Combobox.Root
      readOnly={isComputing}
      collection={collection}
      onValueChange={handleValueChange}
      openOnClick
      size="xs"
      value={selectedValue}
    >
      <InputGroup
        endAddon={
          hasReset ? (
            <HStack alignSelf="stretch" gap="0" height="100%">
              <EditorIconButton
                alignSelf="stretch"
                borderRadius="0"
                disabled={resetDisabled}
                readOnly={isComputing}
                height="auto"
                onClick={handleReset}
                size="xs"
                variant="plain"
              >
                <PiArrowCounterClockwise />
              </EditorIconButton>
            </HStack>
          ) : undefined
        }
        endAddonProps={{ px: 0 }}
        startAddon={<PiTarget />}
        startAddonProps={{ px: '1.5' }}
        width="auto"
      >
        <Combobox.Control width="auto">
          <Combobox.Input
            borderLeftRadius="0"
            borderRightRadius={hasReset ? '0' : undefined}
            borderRightWidth={hasReset ? '0' : undefined}
            fieldSizing="content"
          />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
      </InputGroup>
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content width="max-content">
            <Combobox.List>
              {collection.items.map((component) => {
                const ComponentIcon = getModelIcon(component, subProject)

                return (
                  <Combobox.Item item={component} key={component.id}>
                    <ComponentIcon />
                    <Combobox.ItemText>{component.name}</Combobox.ItemText>
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                )
              })}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
