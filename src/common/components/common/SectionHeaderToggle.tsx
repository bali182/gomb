import { Box } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import type { IconType } from 'react-icons'
import { isDefined } from '../../utils/isDefined'
import { Tooltip } from './Tooltip'

import { useEditorContext } from '../../contexts/EditorContext'
import { MiniButton } from './MiniButton'

type SectionHeaderToggleProps = {
  disabled?: boolean
  tooltip?: string
  value: boolean
  onLabel: string
  offLabel: string
  onIcon: IconType
  offIcon: IconType
  onChange: (newValue: boolean) => void
}

export const SectionHeaderToggle: FC<SectionHeaderToggleProps> = ({
  value,
  disabled = false,
  tooltip,
  onIcon: OnIcon,
  offIcon: OffIcon,
  onLabel,
  offLabel,
  onChange,
}) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const handleClick = useCallback((): void => {
    if (disabled || isComputing) {
      return
    }
    setEditingInputId(undefined)
    onChange(!value)
  }, [disabled, isComputing, onChange, setEditingInputId, value])

  return (
    <Tooltip disabled={!isDefined(tooltip)} content={tooltip}>
      <Box display="inline-flex">
        <MiniButton
          disabled={disabled}
          readOnly={isComputing}
          onClick={handleClick}
          background={value ? 'bg.emphasized' : undefined}
          variant={value ? 'ghost' : 'subtle'}
        >
          {value ? <OnIcon /> : <OffIcon />}
          {value ? onLabel : offLabel}
        </MiniButton>
      </Box>
    </Tooltip>
  )
}
