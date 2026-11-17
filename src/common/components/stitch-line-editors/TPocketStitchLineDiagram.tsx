import { Box, chakra, type SystemStyleObject } from '@chakra-ui/react'
import type { FC, ReactNode } from 'react'

import type { PocketOrientationSchema } from '../../schemas/components'
import type { StitchDirectionSchema } from '../../schemas/stitching'
import { SELECTED_BORDER_COLOR, UNSELECTED_BORDER_COLOR } from './colors'
import { StitchLineEndpointMarker } from './StitchLineEndpointMarker'
import { STITCH_LINE_PADDING_X, STITCH_LINE_PADDING_Y } from './stitchLineSidesAndCornersLayout'

type TPocketStitchLineDiagramProps = {
  stitchDirection: StitchDirectionSchema
  orientation: PocketOrientationSchema
  startOffsetEditor: ReactNode
  endOffsetEditor: ReactNode
  directionEditor: ReactNode
}

export const TPocketStitchLineDiagram: FC<TPocketStitchLineDiagramProps> = ({
  stitchDirection,
  orientation,
  startOffsetEditor,
  endOffsetEditor,
  directionEditor,
}) => {
  const isReversed = stitchDirection === 'end-to-start'
  const layout = T_POCKET_STITCH_LINE_LAYOUTS[orientation]

  return (
    <Box position="relative" width="100%" minWidth="0" minHeight="64" aspectRatio="4 / 3">
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width={T_POCKET_STITCH_LINE_WIDTH}
        height={T_POCKET_STITCH_LINE_HEIGHT}
        transform={`translate(-50%, -50%) ${layout.visualTransform}`}
      >
        <chakra.svg
          aria-hidden="true"
          position="absolute"
          inset="0"
          width="100%"
          height="100%"
          viewBox="0 0 450 300"
          preserveAspectRatio="none"
          fill="none"
          color={UNSELECTED_BORDER_COLOR}
          pointerEvents="none"
          overflow="visible"
        >
          <path
            d="M28 0 H422 Q426 0 426 4 V52 Q426 56 422 56 H382 Q378 56 377 60 L326 296 Q325 300 321 300 H129 Q125 300 124 296 L73 60 Q72 56 68 56 H28 Q24 56 24 52 V4 Q24 0 28 0 Z"
            stroke="currentColor"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </chakra.svg>
        <Box
          position="absolute"
          top={`${T_POCKET_STITCH_LINE_POSITION * 100}%`}
          left={T_POCKET_STITCH_LINE_ENDPOINT_INSET}
          right={T_POCKET_STITCH_LINE_ENDPOINT_INSET}
          height="0"
          color={SELECTED_BORDER_COLOR}
        >
          <Box
            position="absolute"
            insetX="0"
            top="-1.5px"
            borderTopWidth="medium"
            borderColor={SELECTED_BORDER_COLOR}
          />
          <Box position="absolute" left="0" top="0">
            <StitchLineEndpointMarker endpoint={isReversed ? 'end' : 'start'} direction="left" />
          </Box>
          <Box position="absolute" right="0" top="0">
            <StitchLineEndpointMarker endpoint={isReversed ? 'start' : 'end'} direction="right" />
          </Box>
        </Box>
      </Box>
      <Box position="absolute" width="32" {...layout.startOffsetPosition}>
        {isReversed ? endOffsetEditor : startOffsetEditor}
      </Box>
      <Box position="absolute" width="32" {...layout.endOffsetPosition}>
        {isReversed ? startOffsetEditor : endOffsetEditor}
      </Box>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="max-content"
        {...T_POCKET_STITCH_DIRECTION_EDITOR_STYLES[orientation]}
      >
        {directionEditor}
      </Box>
    </Box>
  )
}

type TPocketStitchLineLayout = {
  visualTransform: string
  startOffsetPosition: SystemStyleObject
  endOffsetPosition: SystemStyleObject
}

const T_POCKET_STITCH_DIRECTION_EDITOR_STYLES: Record<PocketOrientationSchema, SystemStyleObject> = {
  up: { mt: '-8' },
  down: { mt: '8' },
  left: {},
  right: {},
}

const T_POCKET_STITCH_LINE_POSITION = 0.86
const T_POCKET_STITCH_LINE_SCALE = 0.9 * 0.85
const T_POCKET_STITCH_LINE_WIDTH = `calc(100% * ${T_POCKET_STITCH_LINE_SCALE})`
const T_POCKET_STITCH_LINE_HEIGHT = `calc((100% - {spacing.${STITCH_LINE_PADDING_Y}} * 2) * ${T_POCKET_STITCH_LINE_SCALE})`
const T_POCKET_STITCH_LINE_ENDPOINT_INSET = `calc(({spacing.${STITCH_LINE_PADDING_X}} + {sizes.32} / 2) * ${T_POCKET_STITCH_LINE_SCALE})`
const T_POCKET_STITCH_LINE_HORIZONTAL_ENDPOINT_POSITION = `calc((100% - ${T_POCKET_STITCH_LINE_WIDTH}) / 2 + ${T_POCKET_STITCH_LINE_ENDPOINT_INSET})`
const T_POCKET_STITCH_LINE_VERTICAL_ENDPOINT_POSITION = `calc(50% - (100% * 4 / 3 * ${T_POCKET_STITCH_LINE_SCALE} / 2 - ${T_POCKET_STITCH_LINE_ENDPOINT_INSET}))`
const T_POCKET_STITCH_LINE_VERTICAL_CENTER_OFFSET = `calc(${T_POCKET_STITCH_LINE_HEIGHT} * ${T_POCKET_STITCH_LINE_POSITION - 0.5})`
const T_POCKET_STITCH_LINE_HORIZONTAL_CENTER_OFFSET = `calc((100% * 3 / 4 - {spacing.${STITCH_LINE_PADDING_Y}} * 2) * ${T_POCKET_STITCH_LINE_SCALE} * ${T_POCKET_STITCH_LINE_POSITION - 0.5})`

const T_POCKET_STITCH_LINE_LAYOUTS: Record<PocketOrientationSchema, TPocketStitchLineLayout> = {
  up: {
    visualTransform: '',
    startOffsetPosition: {
      left: T_POCKET_STITCH_LINE_HORIZONTAL_ENDPOINT_POSITION,
      top: `calc(50% + ${T_POCKET_STITCH_LINE_VERTICAL_CENTER_OFFSET} - {spacing.5})`,
      transform: 'translate(-50%, -100%)',
    },
    endOffsetPosition: {
      right: T_POCKET_STITCH_LINE_HORIZONTAL_ENDPOINT_POSITION,
      top: `calc(50% + ${T_POCKET_STITCH_LINE_VERTICAL_CENTER_OFFSET} - {spacing.5})`,
      transform: 'translate(50%, -100%)',
    },
  },
  down: {
    visualTransform: 'scaleY(-1)',
    startOffsetPosition: {
      left: T_POCKET_STITCH_LINE_HORIZONTAL_ENDPOINT_POSITION,
      top: `calc(50% - ${T_POCKET_STITCH_LINE_VERTICAL_CENTER_OFFSET} + {spacing.5})`,
      transform: 'translateX(-50%)',
    },
    endOffsetPosition: {
      right: T_POCKET_STITCH_LINE_HORIZONTAL_ENDPOINT_POSITION,
      top: `calc(50% - ${T_POCKET_STITCH_LINE_VERTICAL_CENTER_OFFSET} + {spacing.5})`,
      transform: 'translateX(50%)',
    },
  },
  right: {
    visualTransform: 'rotate(90deg)',
    startOffsetPosition: {
      left: `calc(50% - ${T_POCKET_STITCH_LINE_HORIZONTAL_CENTER_OFFSET} + {spacing.5})`,
      top: T_POCKET_STITCH_LINE_VERTICAL_ENDPOINT_POSITION,
      transform: 'translateY(-50%)',
    },
    endOffsetPosition: {
      left: `calc(50% - ${T_POCKET_STITCH_LINE_HORIZONTAL_CENTER_OFFSET} + {spacing.5})`,
      bottom: T_POCKET_STITCH_LINE_VERTICAL_ENDPOINT_POSITION,
      transform: 'translateY(50%)',
    },
  },
  left: {
    visualTransform: 'scaleX(-1) rotate(90deg)',
    startOffsetPosition: {
      right: `calc(50% - ${T_POCKET_STITCH_LINE_HORIZONTAL_CENTER_OFFSET} + {spacing.5})`,
      top: T_POCKET_STITCH_LINE_VERTICAL_ENDPOINT_POSITION,
      transform: 'translateY(-50%)',
    },
    endOffsetPosition: {
      right: `calc(50% - ${T_POCKET_STITCH_LINE_HORIZONTAL_CENTER_OFFSET} + {spacing.5})`,
      bottom: T_POCKET_STITCH_LINE_VERTICAL_ENDPOINT_POSITION,
      transform: 'translateY(50%)',
    },
  },
}
