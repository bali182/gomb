import { Box, type CssProperties, type SystemStyleObject, type Tokens } from '@chakra-ui/react'
import { useCallback, useMemo, useRef, type FC } from 'react'
import { useEditorContext } from '../../contexts/EditorContext'

import type { StitchCornerSchema, StitchSideSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { EditorButton } from '../common/EditorButton'
import { Tooltip, type TooltipProps } from '../common/Tooltip'
import {
  SELECTED_BORDER_COLOR,
  SELECTED_HOVER_BORDER_COLOR,
  UNSELECTED_BORDER_COLOR,
  UNSELECTED_HOVER_BORDER_COLOR,
} from './colors'
import { StitchLineEndpointMarker } from './StitchLineEndpointMarker'
import type { StitchLineOffsetEndpoint } from './stitchLineOffsetEditorUtils'
import {
  STITCH_LINE_PADDING_X,
  STITCH_LINE_PADDING_Y,
  STITCH_LINE_SEGMENT_SIZE,
} from './stitchLineSidesAndCornersLayout'

type StitchLineSegmentLayout = {
  button: SystemStyleObject
  root: SystemStyleObject
  visual: SystemStyleObject
  startMarkerPosition: SystemStyleObject
  endMarkerPosition: SystemStyleObject
  startMarkerDirection: StitchSideSchema
  endMarkerDirection: StitchSideSchema
}

type StitchLineCornerToggleProps = {
  corner: StitchCornerSchema
  disabled: boolean
  onClick: () => void
  selected: boolean
  tooltip: string
  startMarker?: StitchLineOffsetEndpoint
  endMarker?: StitchLineOffsetEndpoint
}

export const StitchLineCornerToggle: FC<StitchLineCornerToggleProps> = ({
  corner,
  disabled,
  onClick,
  selected,
  tooltip,
  startMarker,
  endMarker,
}) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const tooltipAnchorRef = useRef<HTMLDivElement>(null)
  const handleClick = useCallback((): void => {
    setEditingInputId(undefined)
    onClick()
  }, [onClick, setEditingInputId])
  const layout = useMemo<StitchLineSegmentLayout>(() => getCornerLayout(corner), [corner])
  const positioning = useMemo<TooltipProps['positioning']>(
    () => ({
      ...CORNER_TOOLTIP_POSITIONING[corner],
      getAnchorElement: (): HTMLDivElement | null => tooltipAnchorRef.current,
      gutter: 4,
      flip: false,
    }),
    [corner],
  )

  const borderColor = useMemo<CssProperties['borderColor']>(
    () => (selected ? SELECTED_BORDER_COLOR : UNSELECTED_BORDER_COLOR),
    [selected],
  )
  const hoverBorderColor = useMemo<CssProperties['borderColor']>(
    () => (selected ? SELECTED_HOVER_BORDER_COLOR : UNSELECTED_HOVER_BORDER_COLOR),
    [selected],
  )
  const hover = useMemo<SystemStyleObject | undefined>(
    () =>
      disabled === true
        ? undefined
        : { '& > [data-stitch-line-visual]': { borderColor: hoverBorderColor, color: hoverBorderColor } },
    [disabled, hoverBorderColor],
  )

  return (
    <Tooltip content={tooltip} positioning={positioning}>
      <Box {...layout.root}>
        <EditorButton
          aria-pressed={selected}
          cursor={disabled === true ? 'not-allowed' : 'pointer'}
          disabled={disabled}
          readOnly={isComputing}
          onClick={handleClick}
          _disabled={{ opacity: selected ? 1 : 0.4 }}
          _hover={hover}
          unstyled
          {...layout.button}
        >
          <Box borderColor={borderColor} color={borderColor} data-stitch-line-visual="" {...layout.visual}>
            {isDefined(startMarker) && (
              <Box position="absolute" pointerEvents="none" {...layout.startMarkerPosition}>
                <StitchLineEndpointMarker endpoint={startMarker} direction={layout.startMarkerDirection} />
              </Box>
            )}
            {isDefined(endMarker) && (
              <Box position="absolute" pointerEvents="none" {...layout.endMarkerPosition}>
                <StitchLineEndpointMarker endpoint={endMarker} direction={layout.endMarkerDirection} />
              </Box>
            )}
            <Box
              ref={tooltipAnchorRef}
              aria-hidden="true"
              position="absolute"
              top="50%"
              left={corner === 'top-left' || corner === 'bottom-left' ? 0 : undefined}
              right={corner === 'top-right' || corner === 'bottom-right' ? 0 : undefined}
              width="0"
              height="0"
              pointerEvents="none"
            />
          </Box>
        </EditorButton>
      </Box>
    </Tooltip>
  )
}

const CORNER_BORDER_WIDTH: CssProperties['borderWidth'] = 'medium'
const CORNER_RADIUS: Tokens['radii'] = 'md'

const CORNER_TOOLTIP_POSITIONING: Record<StitchCornerSchema, TooltipProps['positioning']> = {
  'top-left': { placement: 'right-start' },
  'top-right': { placement: 'left-start' },
  'bottom-left': { placement: 'right-end' },
  'bottom-right': { placement: 'left-end' },
}

const getCornerLayout = (corner: StitchCornerSchema): StitchLineSegmentLayout => {
  const layouts: Record<StitchCornerSchema, StitchLineSegmentLayout> = {
    'bottom-left': {
      startMarkerPosition: { left: '100%', top: 'calc(100% + 1.5px)' },
      endMarkerPosition: { left: '-1.5px', top: 0 },
      startMarkerDirection: 'right',
      endMarkerDirection: 'top',
      button: {
        bottom: `-${STITCH_LINE_PADDING_Y}`,
        left: `-${STITCH_LINE_PADDING_X}`,
        position: 'absolute',
        right: 0,
        top: 0,
      },
      root: {
        alignSelf: 'end',
        gridArea: 'bottom-left',
        height: STITCH_LINE_SEGMENT_SIZE,
        justifySelf: 'start',
        position: 'relative',
        width: STITCH_LINE_SEGMENT_SIZE,
      },
      visual: {
        borderBottomLeftRadius: CORNER_RADIUS,
        borderBottomWidth: CORNER_BORDER_WIDTH,
        borderLeftWidth: CORNER_BORDER_WIDTH,
        height: STITCH_LINE_SEGMENT_SIZE,
        left: STITCH_LINE_PADDING_X,
        position: 'absolute',
        top: 0,
        width: STITCH_LINE_SEGMENT_SIZE,
      },
    },
    'bottom-right': {
      startMarkerPosition: { left: 'calc(100% + 1.5px)', top: 0 },
      endMarkerPosition: { left: 0, top: 'calc(100% + 1.5px)' },
      startMarkerDirection: 'top',
      endMarkerDirection: 'left',
      button: {
        bottom: `-${STITCH_LINE_PADDING_Y}`,
        left: 0,
        position: 'absolute',
        right: `-${STITCH_LINE_PADDING_X}`,
        top: 0,
      },
      root: {
        alignSelf: 'end',
        gridArea: 'bottom-right',
        height: STITCH_LINE_SEGMENT_SIZE,
        justifySelf: 'end',
        position: 'relative',
        width: STITCH_LINE_SEGMENT_SIZE,
      },
      visual: {
        borderBottomRightRadius: CORNER_RADIUS,
        borderBottomWidth: CORNER_BORDER_WIDTH,
        borderRightWidth: CORNER_BORDER_WIDTH,
        height: STITCH_LINE_SEGMENT_SIZE,
        left: 0,
        position: 'absolute',
        top: 0,
        width: STITCH_LINE_SEGMENT_SIZE,
      },
    },
    'top-left': {
      startMarkerPosition: { left: '-1.5px', top: '100%' },
      endMarkerPosition: { left: '100%', top: '-1.5px' },
      startMarkerDirection: 'bottom',
      endMarkerDirection: 'right',
      button: {
        bottom: 0,
        left: `-${STITCH_LINE_PADDING_X}`,
        position: 'absolute',
        right: 0,
        top: `-${STITCH_LINE_PADDING_Y}`,
      },
      root: {
        alignSelf: 'start',
        gridArea: 'top-left',
        height: STITCH_LINE_SEGMENT_SIZE,
        justifySelf: 'start',
        position: 'relative',
        width: STITCH_LINE_SEGMENT_SIZE,
      },
      visual: {
        borderLeftWidth: CORNER_BORDER_WIDTH,
        borderTopLeftRadius: CORNER_RADIUS,
        borderTopWidth: CORNER_BORDER_WIDTH,
        height: STITCH_LINE_SEGMENT_SIZE,
        left: STITCH_LINE_PADDING_X,
        position: 'absolute',
        top: STITCH_LINE_PADDING_Y,
        width: STITCH_LINE_SEGMENT_SIZE,
      },
    },
    'top-right': {
      startMarkerPosition: { left: 0, top: '-1.5px' },
      endMarkerPosition: { left: 'calc(100% + 1.5px)', top: '100%' },
      startMarkerDirection: 'left',
      endMarkerDirection: 'bottom',
      button: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: `-${STITCH_LINE_PADDING_X}`,
        top: `-${STITCH_LINE_PADDING_Y}`,
      },
      root: {
        alignSelf: 'start',
        gridArea: 'top-right',
        height: STITCH_LINE_SEGMENT_SIZE,
        justifySelf: 'end',
        position: 'relative',
        width: STITCH_LINE_SEGMENT_SIZE,
      },
      visual: {
        borderRightWidth: CORNER_BORDER_WIDTH,
        borderTopRightRadius: CORNER_RADIUS,
        borderTopWidth: CORNER_BORDER_WIDTH,
        height: STITCH_LINE_SEGMENT_SIZE,
        left: 0,
        position: 'absolute',
        top: STITCH_LINE_PADDING_Y,
        width: STITCH_LINE_SEGMENT_SIZE,
      },
    },
  }

  return layouts[corner]
}
