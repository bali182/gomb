import {
  Box,
  Combobox,
  ComboboxRootProps,
  HStack,
  InputGroup,
  Portal,
  Separator,
  createListCollection,
  type ComboboxValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiArrowCounterClockwise } from 'react-icons/pi'

import { useEditorContext } from '../../contexts/EditorContext'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import type { IssueSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { EditorIconButton } from '../common/EditorIconButton'

const stitchHoleDistanceValues = ['2.7', '3.0', '3.38', '3.85', '4.0', '4.5', '5.0', '5.5', '6.0']

const stitchHoleDistanceCollection = createListCollection<string>({
  itemToString: (item) => item,
  itemToValue: (item) => item,
  items: stitchHoleDistanceValues,
})

type StitchHoleDistanceEditorProps = {
  modelId: string
  field: string
  value: string
  issue: IssueSchema | undefined
  onChange: (value: string) => void
  onReset?: () => void
  isResetEnabled: boolean
  size?: ComboboxRootProps['size'] | '2xs'
}

export const StitchHoleDistanceEditor: FC<StitchHoleDistanceEditorProps> = ({
  modelId,
  field,
  isResetEnabled,
  issue,
  onChange,
  onReset,
  value,
  size = 'xs',
}) => {
  const { isComputing, editingInputId, setEditingInputId } = useEditorContext()
  const inputId = `${modelId}:${field}`
  const readOnly = isComputing && editingInputId !== inputId
  const { t } = useTranslation()
  const isCompact = size === '2xs'
  const isInvalid = isDefined(issue) && issue.severity === 'error'

  const selectedValue = useMemo(() => {
    const numValue = Number(value)
    const selectedItem = stitchHoleDistanceValues.find((item) => Number(item) === numValue)
    return isDefined(selectedItem) ? [selectedItem] : []
  }, [value])

  const handleInputValueChange = useCallback(
    (details: Combobox.InputValueChangeDetails): void => {
      if (details.reason !== 'input-change') {
        return
      }
      if (readOnly) {
        return
      }
      setEditingInputId(inputId)
      onChange(details.inputValue)
    },
    [onChange, readOnly, setEditingInputId, inputId],
  )

  const handleValueChange = useCallback(
    (details: ComboboxValueChangeDetails<string>): void => {
      const nextValue = details.value[0]
      if (!isDefined(nextValue)) {
        return
      }
      if (readOnly) {
        return
      }
      setEditingInputId(inputId)
      onChange(nextValue)
    },
    [onChange, readOnly, setEditingInputId, inputId],
  )

  const resetButtonEl = isDefined(onReset) ? (
    <EditorIconButton
      alignSelf="stretch"
      borderRadius="0"
      disabled={!isResetEnabled}
      readOnly={readOnly}
      height="auto"
      onClick={() => {
        setEditingInputId(inputId)
        onReset?.()
      }}
      size={size}
      variant="plain"
    >
      <PiArrowCounterClockwise />
    </EditorIconButton>
  ) : undefined

  return (
    <Combobox.Root
      readOnly={readOnly}
      allowCustomValue
      collection={stitchHoleDistanceCollection}
      inputValue={value}
      onInputValueChange={handleInputValueChange}
      onValueChange={handleValueChange}
      openOnClick
      selectionBehavior="preserve"
      size={isCompact ? 'xs' : size}
      value={selectedValue}
      width="full"
    >
      <InputGroup
        endAddon={
          <HStack alignSelf="stretch" gap="0" height="100%">
            <Box px="1.5">mm</Box>
            {isDefined(resetButtonEl) && (
              <>
                <Separator alignSelf="stretch" orientation="vertical" size="sm" />
                {resetButtonEl}
              </>
            )}
          </HStack>
        }
        endAddonProps={{ px: 0, size }}
        width="full"
      >
        <Combobox.Control width="full">
          <Combobox.Input
            aria-invalid={isInvalid}
            borderRightRadius="0"
            height={isCompact ? '7' : undefined}
            minH={isCompact ? '7' : undefined}
          />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
      </InputGroup>
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.List>
              {stitchHoleDistanceCollection.items.map((item) => (
                <Combobox.Item item={item} key={item}>
                  <Combobox.ItemText>{item}</Combobox.ItemText>
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.List>
            <Combobox.Empty>{t.project.editors.controls.stitchHoleDistance.noMatchingValues}</Combobox.Empty>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
