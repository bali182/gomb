import { Icon } from '@chakra-ui/react'
import { type FC } from 'react'
import type { StitchSideSchema } from '../../schemas/stitching'
import type { StitchLineOffsetEndpoint } from './stitchLineOffsetEditorUtils'
import { STITCH_LINE_ENDPOINT_MARKER_SIZE } from './stitchLineSidesAndCornersLayout'

type StitchLineEndpointMarkerProps = {
  endpoint: StitchLineOffsetEndpoint
  direction: StitchSideSchema
}

export const StitchLineEndpointMarker: FC<StitchLineEndpointMarkerProps> = ({ endpoint, direction }) => {
  return (
    <Icon
      asChild={false}
      aria-hidden="true"
      viewBox="0 0 16 16"
      boxSize={STITCH_LINE_ENDPOINT_MARKER_SIZE}
      position="absolute"
      left="0"
      top="0"
      transform={`translate(-50%, -50%) rotate(${ENDPOINT_MARKER_ROTATIONS[direction]}deg)`}
      pointerEvents="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {endpoint === 'start' ? <StartMarker /> : <EndMarker />}
    </Icon>
  )
}

const StartMarker: FC = () => <line x1="8" y1="2" x2="8" y2="14" />

const EndMarker: FC = () => <polyline points="2,2 8,8 2,14" />

const ENDPOINT_MARKER_ROTATIONS: Record<StitchSideSchema, number> = {
  top: 270,
  right: 0,
  bottom: 90,
  left: 180,
}
