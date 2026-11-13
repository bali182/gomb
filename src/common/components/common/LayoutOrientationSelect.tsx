import { FC } from 'react'
import { IconType } from 'react-icons'
import { PiColumns, PiRows } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { LayoutOrientationSchema } from '../../schemas/components'
import { EditorSelect } from './EditorSelect'

type LayoutOrientationSelectProps = {
  value: LayoutOrientationSchema | null
  disabled?: boolean
  onChange: (value: LayoutOrientationSchema) => void
}

export const LayoutOrientationSelect: FC<LayoutOrientationSelectProps> = ({ value, disabled, onChange }) => {
  const { t } = useTranslation()

  return (
    <EditorSelect
      disabled={disabled}
      labels={t.project.editors.enums.components.layoutOrientation}
      items={anchorValues}
      icons={icons}
      value={value}
      onChange={onChange}
    />
  )
}

const anchorValues: LayoutOrientationSchema[] = ['horizontal', 'vertical']

const icons: Record<LayoutOrientationSchema, IconType> = {
  horizontal: PiColumns,
  vertical: PiRows,
}
