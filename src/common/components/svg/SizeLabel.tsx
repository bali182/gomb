import { FC, useMemo } from 'react'
import { IconType } from 'react-icons'
import { useProject } from '../../hooks/useProject'
import { useTranslation } from '../../hooks/useTranslation'
import { RectSchema } from '../../schemas/geometry'
import { StitchCornerSchema, StitchSideSchema } from '../../schemas/stitching'
import { Label } from './Label'

const SIZE_LABEL_BASE_MARGIN = 2
const SIZE_LABEL_DEFAULT_PADDING_X = 1.5
const SIZE_LABEL_DEFAULT_PADDING_Y = 0.3
const SIZE_LABEL_DEFAULT_GAP = 0.3

export type SizeLabelProps = {
  icon: IconType
  boundingRect: RectSchema
  reference: StitchSideSchema | StitchCornerSchema
  ignoreStitchMargin?: boolean
}

export const SizeLabel: FC<SizeLabelProps> = ({ boundingRect, icon, reference, ignoreStitchMargin }) => {
  const { t } = useTranslation()
  const { project } = useProject()

  const label = useMemo(
    () =>
      t.formatters.dimensionsShort(
        t.formatters.number.max1(boundingRect.width.toNumber()),
        t.formatters.number.max1(boundingRect.height.toNumber()),
      ),
    [boundingRect.height, boundingRect.width, t.formatters],
  )

  return (
    <Label
      margin={
        ignoreStitchMargin ? SIZE_LABEL_BASE_MARGIN : project.stitchingSettings.stitchMargin + SIZE_LABEL_BASE_MARGIN
      }
      paddingX={SIZE_LABEL_DEFAULT_PADDING_X}
      paddingY={SIZE_LABEL_DEFAULT_PADDING_Y}
      gap={SIZE_LABEL_DEFAULT_GAP}
      icon={icon}
      label={label}
      reference={reference}
      boundingRect={boundingRect}
    />
  )
}
