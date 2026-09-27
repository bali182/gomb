import { FC, useMemo } from 'react'
import { IconType } from 'react-icons'
import { useTranslation } from '../../hooks/useTranslation'
import { RectSchema } from '../../schemas/geometry'
import { StitchCornerSchema, StitchSideSchema } from '../../schemas/stitching'
import { Label } from './Label'

export type SizeLabelProps = {
  icon: IconType
  boundingRect: RectSchema
  reference: StitchSideSchema | StitchCornerSchema
}

export const SizeLabel: FC<SizeLabelProps> = ({ boundingRect, icon, reference }) => {
  const { t } = useTranslation()

  const label = useMemo(
    () =>
      t.formatters.dimensionsShort(
        t.formatters.number.max1(boundingRect.width.toNumber()),
        t.formatters.number.max1(boundingRect.height.toNumber()),
      ),
    [boundingRect.height, boundingRect.width, t.formatters],
  )

  return <Label icon={icon} label={label} reference={reference} boundingRect={boundingRect} />
}
