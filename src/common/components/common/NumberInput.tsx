import { Box, HStack, Input, InputGroup, Separator, type InputProps, type Tokens } from '@chakra-ui/react'
import { useEffect, useRef, type FC, type ReactNode } from 'react'
import { PiArrowCounterClockwise } from 'react-icons/pi'

import { useNumberEditorStepContext } from '../../contexts/NumberEditorStepContext'
import type { IssueSchema, SeveritySchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { EditorIconButton } from './EditorIconButton'

export type NumberInputProps = {
  value: string | undefined
  issue: IssueSchema | undefined
  placeholder?: string
  onChange: (value: string) => void
  onReset?: () => void
  isResetEnabled?: boolean
  disabled?: boolean
  readOnly?: boolean
  startAddon?: ReactNode
  unit?: string
  step?: number
  size?: InputProps['size']
  opacity?: number
}

const issueBorderColors: Partial<Record<SeveritySchema, Tokens['colors']>> = {
  error: 'border.error',
  warning: 'border.warning',
}

// TODO do we need this as a component?
export const NumberInput: FC<NumberInputProps> = ({
  disabled,
  readOnly,
  issue,
  onChange,
  onReset,
  size = 'xs',
  startAddon,
  step: overwriteStep,
  unit,
  value,
  placeholder,
  isResetEnabled,
  opacity,
}) => {
  const issueBorderColor = isDefined(issue) ? issueBorderColors[issue.severity] : undefined
  const { step } = useNumberEditorStepContext()
  const inputRef = useRef<HTMLInputElement>(null)

  // React leaves defaultValue unchanged while a number input is focused, but the browser uses it as the native step base.
  useEffect(() => {
    const inputElement = inputRef.current

    if (isDefined(inputElement)) {
      inputElement.defaultValue = value ?? ''
    }
  }, [value])

  const input = (
    <Input
      borderColor={issueBorderColor}
      disabled={disabled}
      readOnly={readOnly}
      focusRingColor={issueBorderColor}
      inputMode="decimal"
      onChange={(event) => onChange(event.currentTarget.value)}
      ref={inputRef}
      step={overwriteStep ?? step}
      type="number"
      value={value}
      placeholder={placeholder}
      size={size}
      opacity={opacity}
    />
  )

  const resetButtonEl = isDefined(onReset) ? (
    <EditorIconButton
      alignSelf="stretch"
      borderRadius="0"
      disabled={!isResetEnabled}
      readOnly={readOnly}
      height="auto"
      onClick={onReset}
      size="xs"
      variant="plain"
    >
      <PiArrowCounterClockwise />
    </EditorIconButton>
  ) : undefined

  const unitEl = isDefined(unit) ? <Box px="1.5">{unit}</Box> : undefined

  const resolvedEndAddon =
    isDefined(resetButtonEl) || isDefined(unitEl) ? (
      <HStack alignSelf="stretch" gap="0" height="100%">
        {isDefined(resetButtonEl) && isDefined(unitEl) ? (
          <>
            {unitEl}
            <Separator alignSelf="stretch" orientation="vertical" size="sm" />
            {resetButtonEl}
          </>
        ) : (
          (resetButtonEl ?? unitEl)
        )}
      </HStack>
    ) : undefined

  if (!isDefined(startAddon) && !isDefined(resolvedEndAddon)) {
    return input
  }

  return (
    <InputGroup
      endAddon={resolvedEndAddon}
      endAddonProps={{ size, px: 0 }}
      startAddon={startAddon}
      startAddonProps={{ size, px: '1.5' }}
      opacity={opacity}
    >
      {input}
    </InputGroup>
  )
}
