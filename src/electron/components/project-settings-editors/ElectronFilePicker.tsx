import { Button, HStack, IconButton, Input, InputGroup, Separator } from '@chakra-ui/react'
import { useCallback, type ChangeEvent, type FC } from 'react'
import { PiArrowCounterClockwise, PiFolder } from 'react-icons/pi'

import { useTranslation } from '../../../common/hooks/useTranslation'

type ElectronFilePickerProps = {
  value: string
  disabled?: boolean
  isManuallyModified: boolean
  onReset: () => void
  onChange: (value: string) => void
  onFilePickerButtonPressed: () => void
}

export const ElectronFilePicker: FC<ElectronFilePickerProps> = ({
  disabled,
  onChange,
  onFilePickerButtonPressed,
  value,
  isManuallyModified,
  onReset,
}) => {
  const { t } = useTranslation()
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onChange(event.currentTarget.value)
    },
    [onChange],
  )

  return (
    <InputGroup
      endAddon={
        <HStack alignSelf="stretch" gap="0" height="100%">
          <Button
            alignSelf="stretch"
            borderRadius="0"
            disabled={disabled}
            height="auto"
            onClick={onFilePickerButtonPressed}
            size="xs"
            variant="plain"
          >
            <PiFolder />
            {t.project.editors.controls.filePicker.browse}
          </Button>
          <Separator alignSelf="stretch" orientation="vertical" size="sm" />
          <IconButton
            alignSelf="stretch"
            borderRadius="0"
            disabled={!isManuallyModified || disabled}
            height="auto"
            onClick={onReset}
            size="xs"
            variant="plain"
          >
            <PiArrowCounterClockwise />
          </IconButton>
        </HStack>
      }
      endAddonProps={{ px: 0, size: 'xs' }}
    >
      <Input disabled={disabled} onChange={handleChange} size="xs" value={value} />
    </InputGroup>
  )
}
