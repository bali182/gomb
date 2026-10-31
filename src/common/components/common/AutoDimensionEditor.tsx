import { Box, HStack, Switch } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import type { IconType } from 'react-icons'

import { useEditorContext } from '../../contexts/EditorContext'
import type { IssueSchema } from '../../schemas/issues'
import { EditorNumberInput } from './EditorNumberInput'

type AutoDimensionEditorProps = {
  modelId: string
  field: string
  auto: boolean
  autoIcon: IconType
  placeholder: string
  issue: IssueSchema | undefined
  manualIcon: IconType
  onAutoChange: (auto: boolean) => void
  onValueChange: (value: string) => void
  step?: number
  unit?: string
  value: string | undefined
}

export const AutoDimensionEditor: FC<AutoDimensionEditorProps> = ({
  modelId,
  field,
  auto,
  placeholder,
  issue,
  unit,
  value,
  autoIcon: AutoIcon,
  manualIcon: ManualIcon,
  onAutoChange,
  onValueChange,
}) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const handleCheckedChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      if (isComputing) {
        return
      }
      setEditingInputId(undefined)
      onAutoChange(!details.checked)
    },
    [isComputing, onAutoChange, setEditingInputId],
  )

  return (
    <HStack gap="2">
      <Switch.Root readOnly={isComputing} checked={!auto} onCheckedChange={handleCheckedChange} size="md">
        <Switch.HiddenInput />
        <Switch.Control bg="bg.emphasized" _checked={{ bg: 'bg.emphasized' }}>
          <Switch.Thumb bg="bg.panel" _checked={{ bg: 'bg.panel' }}>
            <Switch.ThumbIndicator fallback={<AutoIcon />}>
              <ManualIcon />
            </Switch.ThumbIndicator>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Root>
      <Box flex="1" minWidth="0">
        <EditorNumberInput
          modelId={modelId}
          field={field}
          disabled={auto}
          issue={issue}
          onChange={onValueChange}
          placeholder={auto ? placeholder : ''}
          unit={unit}
          value={auto ? '' : value}
        />
      </Box>
    </HStack>
  )
}
