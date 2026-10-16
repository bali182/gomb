import { useCallback, type FC } from 'react'
import type { IconType } from 'react-icons'

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
  const handleClick = useCallback(() => {
    onChange(!value)
  }, [onChange, value])

  return (
    <SectionHeaderButton
      onClick={handleClick}
      background={value ? 'bg.emphasized' : undefined}
      variant={value ? 'ghost' : 'subtle'}
    >
      {value ? <OnIcon /> : <OffIcon />}
      {value ? onLabel : offLabel}
    </SectionHeaderButton>
  )
}
