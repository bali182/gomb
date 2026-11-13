import { FC } from 'react'
import { IconType } from 'react-icons'
import {
  PiAlignBottomSimple,
  PiAlignCenterHorizontalSimple,
  PiAlignCenterVerticalSimple,
  PiAlignLeftSimple,
  PiAlignRightSimple,
  PiAlignTopSimple,
} from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import { AnchorSchema } from '../../schemas/common'
import { LayoutOrientationSchema } from '../../schemas/components'
import { EditorSelect } from './EditorSelect'

type AnchorSelectProps = {
  value: AnchorSchema | null
  disabled?: boolean
  orientation: LayoutOrientationSchema
  onChange: (value: AnchorSchema) => void
}

export const AnchorSelect: FC<AnchorSelectProps> = ({ value, disabled, orientation, onChange }) => {
  const { t } = useTranslation()
  const labels =
    orientation === 'horizontal'
      ? t.project.editors.enums.common.anchor.horizontal
      : t.project.editors.enums.common.anchor.vertical

  const icons = iconsByLayout[orientation]

  return (
    <EditorSelect
      disabled={disabled}
      labels={labels}
      items={anchorValues}
      icons={icons}
      value={value}
      onChange={onChange}
    />
  )
}

const anchorValues: AnchorSchema[] = ['start', 'middle', 'end']

const iconsByLayout: Record<LayoutOrientationSchema, Record<AnchorSchema, IconType>> = {
  horizontal: {
    start: PiAlignLeftSimple,
    middle: PiAlignCenterHorizontalSimple,
    end: PiAlignRightSimple,
  },
  vertical: {
    start: PiAlignTopSimple,
    middle: PiAlignCenterVerticalSimple,
    end: PiAlignBottomSimple,
  },
}
