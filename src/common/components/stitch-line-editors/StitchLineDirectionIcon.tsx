import { Icon, type IconProps } from '@chakra-ui/react'
import { useMemo, type FC } from 'react'
import type { IconType } from 'react-icons'

import {
  STITCH_LINE_DIRECTION_CORNERS,
  STITCH_LINE_DIRECTION_SIDES,
} from '../../logic/stitching/stitchLineSidesAndCorners'
import type { HasStitchedCornersSchema, HasStitchedSidesSchema, StitchDirectionSchema } from '../../schemas/stitching'
import { StitchLineDirectionClosedIcon } from '../icons/StitchLineDirectionClosedIcon'
import { StitchLineDirectionCornerIcon } from '../icons/StitchLineDirectionCornerIcon'
import { StitchLineDirectionSideIcon } from '../icons/StitchLineDirectionSideIcon'
import { StitchLineDirectionThreeSidesTwoCornersIcon } from '../icons/StitchLineDirectionThreeSidesTwoCornersIcon'
import { StitchLineDirectionTwoSidesCornerIcon } from '../icons/StitchLineDirectionTwoSidesCornerIcon'

type StitchLineDirectionIconProps = IconProps & {
  value: HasStitchedSidesSchema & HasStitchedCornersSchema
  stitchDirection: StitchDirectionSchema
}

export const StitchLineDirectionIcon: FC<StitchLineDirectionIconProps> = ({ value, stitchDirection, ...props }) => {
  const sides = useMemo<(keyof HasStitchedSidesSchema)[]>(
    () => STITCH_LINE_DIRECTION_SIDES.filter((side) => value[side]),
    [value],
  )
  const corners = useMemo<(keyof HasStitchedCornersSchema)[]>(
    () => STITCH_LINE_DIRECTION_CORNERS.filter((corner) => value[corner]),
    [value],
  )

  const sideCount = sides.length
  const cornerCount = corners.length

  const DirectionIcon = useMemo<IconType>(() => {
    if (sideCount === 0 && cornerCount > 0) {
      return StitchLineDirectionCornerIcon
    }
    switch (sideCount) {
      case 2:
        return StitchLineDirectionTwoSidesCornerIcon
      case 3:
        return StitchLineDirectionThreeSidesTwoCornersIcon
      case 4:
        return StitchLineDirectionClosedIcon
      default: {
        return StitchLineDirectionSideIcon
      }
    }
  }, [sideCount, cornerCount])

  const rotationAngle = useMemo<number>(() => {
    if ((sideCount === 0 && value.bottomRightCorner) || (value.right && !value.top)) {
      return 90
    }
    if ((sideCount === 0 && value.bottomLeftCorner) || (value.bottom && !value.right)) {
      return 180
    }
    if ((sideCount === 0 && value.topLeftCorner) || (value.left && !value.bottom)) {
      return 270
    }
    return 0
  }, [value, sideCount])

  const reflection = useMemo<string>(() => {
    if ((sideCount === 0 && cornerCount > 0) || sideCount === 2) {
      return 'rotate(90) scale(-1 1)'
    }
    if (sideCount === 3) {
      return 'scale(1 -1)'
    }
    if (sideCount === 4) {
      return 'rotate(90) scale(1 -1)'
    }
    return 'scale(-1 1)'
  }, [sideCount, cornerCount])

  const transform = useMemo<string>(() => {
    if (stitchDirection === 'end-to-start') {
      return `translate(128 128) rotate(${rotationAngle}) ${reflection} translate(-128 -128)`
    }
    return `translate(128 128) rotate(${rotationAngle}) translate(-128 -128)`
  }, [rotationAngle, reflection, stitchDirection])

  return (
    <Icon asChild={false} viewBox="0 0 256 256" fill="none" {...props}>
      <g transform={transform}>
        <DirectionIcon size="100%" />
      </g>
    </Icon>
  )
}
