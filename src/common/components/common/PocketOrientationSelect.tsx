import { FC } from 'react'
import { IconType } from 'react-icons'
import { useTranslation } from '../../hooks/useTranslation'
import { PocketOrientationSchema } from '../../schemas/components'
import { PocketOrientationDownIcon } from '../icons/PocketOrientationDownIcon'
import { PocketOrientationLeftIcon } from '../icons/PocketOrientationLeftIcon'
import { PocketOrientationRightIcon } from '../icons/PocketOrientationRightIcon'
import { PocketOrientationUpIcon } from '../icons/PocketOrientationUpIcon'
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
      items={values}
      icons={icons}
      value={value}
      onChange={onChange}
    />
  )
}

const values: PocketOrientationSchema[] = ['up', 'down', 'left', 'right']

const icons: Record<PocketOrientationSchema, IconType> = {
  up: PocketOrientationUpIcon,
  down: PocketOrientationDownIcon,
  left: PocketOrientationLeftIcon,
  right: PocketOrientationRightIcon,
}
