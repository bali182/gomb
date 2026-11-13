import { FC } from 'react'
import { IconType } from 'react-icons'
import { PiCaretDown, PiCaretLeft, PiCaretRight, PiCaretUp } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { PocketOrientationSchema } from '../../schemas/components'
import { EditorSelect } from './EditorSelect'

type PocketOrientationSelectProps = {
  value: PocketOrientationSchema | null
  disabled?: boolean
  onChange: (value: PocketOrientationSchema) => void
}

export const PocketOrientationSelect: FC<PocketOrientationSelectProps> = ({ value, disabled, onChange }) => {
  const { t } = useTranslation()

  return (
    <EditorSelect
      disabled={disabled}
      labels={t.project.editors.enums.components.pocketOrientation}
      items={anchorValues}
      icons={icons}
      value={value}
      onChange={onChange}
    />
  )
}

const anchorValues: PocketOrientationSchema[] = ['up', 'down', 'left', 'right']

const icons: Record<PocketOrientationSchema, IconType> = {
  up: PiCaretDown,
  down: PiCaretUp,
  left: PiCaretRight,
  right: PiCaretLeft,
}
