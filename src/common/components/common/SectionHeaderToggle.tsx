import { useCallback, type FC } from 'react'
import type { IconType } from 'react-icons'

import { useEditorContext } from '../../contexts/EditorContext'
import { SectionHeaderButton } from './SectionHeaderButton'

type SectionHeaderToggleProps = {
  value: boolean
  onLabel: string
  offLabel: string
  onIcon: IconType
  offIcon: IconType
  onChange: (newValue: boolean) => void
}

export const SectionHeaderToggle: FC<SectionHeaderToggleProps> = ({
  value,
  onIcon: OnIcon,
  offIcon: OffIcon,
  onLabel,
  offLabel,
  onChange,
}) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const handleClick = useCallback(() => {
    setEditingInputId(undefined)
    onChange(!value)
  }, [onChange, setEditingInputId, value])

  return (
    <SectionHeaderButton
      readOnly={isComputing}
      onClick={handleClick}
      background={value ? 'bg.emphasized' : undefined}
      variant={value ? 'ghost' : 'subtle'}
    >
      {value ? <OnIcon /> : <OffIcon />}
      {value ? onLabel : offLabel}
    </SectionHeaderButton>
  )
}
