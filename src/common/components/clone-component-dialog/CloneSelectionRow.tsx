import { RadioGroup, Text, VisuallyHidden, VStack } from '@chakra-ui/react'
import type { FC } from 'react'
import { isDefined } from '../../utils/isDefined'
import { Tooltip } from '../common/Tooltip'
import { CloneRowContext } from './CloneRowContext'
import type { CloneAction, CloneDialogRow, CloneOption } from './types'

// TODO: Ikonok

type CloneSelectionRowProps = {
  row: CloneDialogRow
  options: CloneOption[]
  columns: string
  showPath: boolean
  onChange: (action: CloneAction) => void
}

export const CloneSelectionRow: FC<CloneSelectionRowProps> = ({ row, options, columns, showPath, onChange }) => (
  <RadioGroup.Root
    value={row.action}
    disabled={row.disabled}
    onValueChange={(details) => {
      const option = options.find((candidate) => candidate.value === details.value)
      if (isDefined(option)) {
        onChange(option.value)
      }
    }}
    display="grid"
    gridTemplateColumns={columns}
    gap="0"
    alignItems="stretch"
    borderTopWidth="1px"
  >
    <RadioGroup.Label asChild>
      <VStack align="stretch" gap="1" px="3" py="2" minW="0">
        <Text textStyle="sm" fontWeight="medium" overflowWrap="anywhere">
          {row.name}
        </Text>
        <CloneRowContext components={row.components} showPath={showPath} />
      </VStack>
    </RadioGroup.Label>
    {options.map((option) => (
      <Tooltip key={option.value} content={option.translation.tooltip}>
        <RadioGroup.Item
          value={option.value}
          disabled={row.disabled || row.disabledActions.includes(option.value)}
          justifyContent="center"
          alignItems="center"
          m="0"
          minH="12"
          cursor="pointer"
          _hover={{ bg: 'bg.muted' }}
          _disabled={{ cursor: 'default', opacity: 0.5 }}
          _focusWithin={{ outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '-2px' }}
        >
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemText asChild>
            <VisuallyHidden>{option.translation.label}</VisuallyHidden>
          </RadioGroup.ItemText>
          <RadioGroup.ItemIndicator _disabled={{ opacity: 1 }} />
        </RadioGroup.Item>
      </Tooltip>
    ))}
  </RadioGroup.Root>
)
