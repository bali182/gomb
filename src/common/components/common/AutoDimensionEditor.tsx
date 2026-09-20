import { Box, HStack, Switch } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import type { IconType } from 'react-icons'

import type { IssueSchema } from '../../schemas/validation'
import { NumberInput } from './NumberInput'

type AutoDimensionEditorProps = {
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
  const handleCheckedChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onAutoChange(!details.checked)
    },
    [onAutoChange],
  )

  return (
    <HStack gap="2">
      <Switch.Root checked={!auto} onCheckedChange={handleCheckedChange} size="md">
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb>
            <Switch.ThumbIndicator fallback={<AutoIcon />}>
              <ManualIcon />
            </Switch.ThumbIndicator>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Root>
      <Box flex="1" minWidth="0">
        <NumberInput
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
