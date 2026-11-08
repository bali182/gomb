import { Box, type CssProperties, type SystemStyleObject } from '@chakra-ui/react'
import { useCallback, useMemo, useRef, type FC } from 'react'
import { useEditorContext } from '../../contexts/EditorContext'

import type { StitchSideSchema } from '../../schemas/stitching'
import { EditorButton } from '../common/EditorButton'
import { Tooltip, type TooltipProps } from '../common/Tooltip'
import {
  SELECTED_BORDER_COLOR,
  SELECTED_HOVER_BORDER_COLOR,
  UNSELECTED_BORDER_COLOR,
  UNSELECTED_HOVER_BORDER_COLOR,
} from './colors'
import {
  STITCH_LINE_PADDING_X,
  STITCH_LINE_PADDING_Y,
  STITCH_LINE_SEGMENT_SIZE,
} from './stitchLineSidesAndCornersLayout'

type StitchLineSegmentLayout = {
  button: SystemStyleObject
  root: SystemStyleObject
  visual: SystemStyleObject
}

type StitchLineEdgeToggleProps = {
  disabled: boolean
  onClick: () => void
  selected: boolean
  side: StitchSideSchema
  tooltip: string
}

export const StitchLineEdgeToggle: FC<StitchLineEdgeToggleProps> = ({ disabled, onClick, selected, side, tooltip }) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const visualRef = useRef<HTMLDivElement>(null)
  const handleClick = useCallback((): void => {
    setEditingInputId(undefined)
    onClick()
  }, [onClick, setEditingInputId])
  const layout = useMemo<StitchLineSegmentLayout>(() => getSideLayout(side), [side])
  const positioning = useMemo<TooltipProps['positioning']>(
    () => ({
      getAnchorElement: (): HTMLDivElement | null => visualRef.current,
      placement: SIDE_TOOLTIP_PLACEMENTS[side],
      gutter: 4,
      flip: false,
    }),
    [side],
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
    () => (disabled ? undefined : { '& > [data-stitch-line-visual]': { borderColor: hoverBorderColor } }),
    [disabled, hoverBorderColor],
  )

  return (
    <Tooltip content={tooltip} positioning={positioning}>
      <Box {...layout.root}>
        <EditorButton
          readOnly={isComputing}
          aria-pressed={selected}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          disabled={disabled}
          _disabled={{ opacity: selected ? 1 : 0.4 }}
          onClick={handleClick}
          _hover={hover}
          unstyled
          {...layout.button}
        >
          <Box ref={visualRef} borderColor={borderColor} data-stitch-line-visual="" {...layout.visual} />
        </EditorButton>
      </Box>
    </Tooltip>
  )
}

const EDGE_BORDER_WIDTH: CssProperties['borderWidth'] = 'medium'

const SIDE_TOOLTIP_PLACEMENTS: Record<StitchSideSchema, StitchSideSchema> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
}

const getSideLayout = (side: StitchSideSchema): StitchLineSegmentLayout => {
  const layouts: Record<StitchSideSchema, StitchLineSegmentLayout> = {
    bottom: {
      button: {
        bottom: `-${STITCH_LINE_PADDING_Y}`,
        height: `calc({spacing.${STITCH_LINE_PADDING_Y}} * 2)`,
        left: 0,
        position: 'absolute',
        right: 0,
      },
      root: {
        alignSelf: 'end',
        gridArea: 'bottom',
        height: STITCH_LINE_SEGMENT_SIZE,
        justifySelf: 'stretch',
        position: 'relative',
        width: '100%',
      },
      visual: {
        borderBottomWidth: EDGE_BORDER_WIDTH,
        bottom: STITCH_LINE_PADDING_Y,
        height: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
      },
    },
    left: {
      button: {
        bottom: 0,
        left: `-${STITCH_LINE_PADDING_X}`,
        position: 'absolute',
        top: 0,
        width: `calc({spacing.${STITCH_LINE_PADDING_X}} * 2)`,
      },
      root: {
        alignSelf: 'stretch',
        gridArea: 'left',
        height: '100%',
        justifySelf: 'start',
        position: 'relative',
        width: STITCH_LINE_SEGMENT_SIZE,
      },
      visual: {
        borderLeftWidth: EDGE_BORDER_WIDTH,
        height: '100%',
        left: STITCH_LINE_PADDING_X,
        position: 'absolute',
        top: 0,
        width: 0,
      },
    },
    right: {
      button: {
        bottom: 0,
        position: 'absolute',
        right: `-${STITCH_LINE_PADDING_X}`,
        top: 0,
        width: `calc({spacing.${STITCH_LINE_PADDING_X}} * 2)`,
      },
      root: {
        alignSelf: 'stretch',
        gridArea: 'right',
        height: '100%',
        justifySelf: 'end',
        position: 'relative',
        width: STITCH_LINE_SEGMENT_SIZE,
      },
      visual: {
        borderRightWidth: EDGE_BORDER_WIDTH,
        height: '100%',
        right: STITCH_LINE_PADDING_X,
        position: 'absolute',
        top: 0,
        width: 0,
      },
    },
    top: {
      button: {
        height: `calc({spacing.${STITCH_LINE_PADDING_Y}} * 2)`,
        left: 0,
        position: 'absolute',
        right: 0,
        top: `-${STITCH_LINE_PADDING_Y}`,
      },
      root: {
        alignSelf: 'start',
        gridArea: 'top',
        height: STITCH_LINE_SEGMENT_SIZE,
        justifySelf: 'stretch',
        position: 'relative',
        width: '100%',
      },
      visual: {
        borderTopWidth: EDGE_BORDER_WIDTH,
        height: 0,
        left: 0,
        position: 'absolute',
        top: STITCH_LINE_PADDING_Y,
        width: '100%',
      },
    },
  }

  return layouts[side]
}
