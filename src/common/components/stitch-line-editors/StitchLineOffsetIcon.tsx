import { Icon, type IconProps } from '@chakra-ui/react'
import { useMemo, type FC } from 'react'
import type { IconType } from 'react-icons'

import type { StitchLineSideOrCornerField } from '../../logic/stitching/stitchLineSidesAndCorners'
import { StitchLineDirectionCornerIcon } from '../icons/StitchLineDirectionCornerIcon'
import { StitchLineDirectionSideIcon } from '../icons/StitchLineDirectionSideIcon'
import { StitchLineOffsetClosedIcon } from '../icons/StitchLineOffsetClosedIcon'
import type { StitchLineOffsetEndpoint } from './stitchLineOffsetEditorUtils'

type StitchLineOffsetIconProps = Omit<IconProps, 'position'> & {
  position: StitchLineSideOrCornerField
  endpoint: StitchLineOffsetEndpoint
  isClosed: boolean
}

export const StitchLineOffsetIcon: FC<StitchLineOffsetIconProps> = ({ position, endpoint, isClosed, ...props }) => {
  const isCorner = useMemo<boolean>(() => {
    switch (position) {
      case 'top':
      case 'right':
      case 'bottom':
      case 'left':
        return false
      case 'topRightCorner':
      case 'bottomRightCorner':
      case 'bottomLeftCorner':
      case 'topLeftCorner':
        return true
    }
  }, [position])

  const OffsetIcon = useMemo<IconType>(() => {
    if (isClosed) {
      return StitchLineOffsetClosedIcon
    }
    if (isCorner) {
      return StitchLineDirectionCornerIcon
    }
    return StitchLineDirectionSideIcon
  }, [isCorner, isClosed])

  const transform = useMemo<string>(() => {
    if (isClosed) {
      return ''
    }
    const rotationAngle = STITCH_LINE_OFFSET_ICON_ROTATIONS[position]
    if (endpoint === 'end') {
      return `translate(128 128) rotate(${rotationAngle}) translate(-128 -128)`
    }
    if (isCorner) {
      return `translate(128 128) rotate(${rotationAngle + 90}) scale(-1 1) translate(-128 -128)`
    }
    return `translate(128 128) rotate(${rotationAngle}) scale(-1 1) translate(-128 -128)`
  }, [position, endpoint, isClosed, isCorner])

  return (
    <Icon asChild={false} viewBox="0 0 256 256" fill="none" {...props}>
      <g transform={transform}>
        <OffsetIcon size="100%" />
      </g>
    </Icon>
  )
}

const STITCH_LINE_OFFSET_ICON_ROTATIONS: Record<StitchLineSideOrCornerField, number> = {
  top: 0,
  topRightCorner: 0,
  right: 90,
  bottomRightCorner: 90,
  bottom: 180,
  bottomLeftCorner: 180,
  left: 270,
  topLeftCorner: 270,
}
