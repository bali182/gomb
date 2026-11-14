import { FC } from 'react'
import { IconType } from 'react-icons'
import { useTranslation } from '../../hooks/useTranslation'
import { PocketItemOrientationSchema } from '../../schemas/pocketItem'
import { PocketItemOrientationLandscapeIcon } from '../icons/PocketItemOrientationLandscapeIcon'
import { PocketItemOrientationPortraitIcon } from '../icons/PocketItemOrientationPortraitIcon'
import { EditorSelect } from './EditorSelect'

type PocketItemOrientationSelectProps = {
  value: PocketItemOrientationSchema | null
  disabled?: boolean
  onChange: (value: PocketItemOrientationSchema) => void
}

export const PocketItemOrientationSelect: FC<PocketItemOrientationSelectProps> = ({ value, disabled, onChange }) => {
  const { t } = useTranslation()

  return (
    <EditorSelect
      disabled={disabled}
      labels={t.project.editors.enums.components.itemOrientation}
      items={values}
      icons={icons}
      value={value}
      onChange={onChange}
    />
  )
}

const values: PocketItemOrientationSchema[] = ['portrait', 'landscape']

const icons: Record<PocketItemOrientationSchema, IconType> = {
  portrait: PocketItemOrientationPortraitIcon,
  landscape: PocketItemOrientationLandscapeIcon,
}
