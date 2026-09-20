import { Box, Button, type CssProperties, type SystemStyleObject, type Tokens } from '@chakra-ui/react'
import { useMemo, type FC } from 'react'

import type { StitchCornerSchema } from '../../schemas/stitching'
import {
  SELECTED_BORDER_COLOR,
  SELECTED_HOVER_BORDER_COLOR,
  UNSELECTED_BORDER_COLOR,
  UNSELECTED_HOVER_BORDER_COLOR,
} from './colors'

type StitchLineSegmentLayout = {
  button: SystemStyleObject
  root: SystemStyleObject
  visual: SystemStyleObject
}

type StitchLineCornerToggleProps = {
  corner: StitchCornerSchema
  disabled: boolean
  onClick: () => void
  selected: boolean
}

export const StitchLineCornerToggle: FC<StitchLineCornerToggleProps> = ({ corner, disabled, onClick, selected }) => {
  const layout = useMemo<StitchLineSegmentLayout>(() => getCornerLayout(corner), [corner])

  const borderColor = useMemo<CssProperties['borderColor']>(
    () => (selected ? SELECTED_BORDER_COLOR : UNSELECTED_BORDER_COLOR),
    [selected],
  )
  const hoverBorderColor = useMemo<CssProperties['borderColor']>(
    () => (selected ? SELECTED_HOVER_BORDER_COLOR : UNSELECTED_HOVER_BORDER_COLOR),
    [selected],
  )
  const hover = useMemo<SystemStyleObject | undefined>(
    () => (disabled === true ? undefined : { '& > [data-stitch-line-visual]': { borderColor: hoverBorderColor } }),
    [disabled, hoverBorderColor],
  )

  return (
    <Box {...layout.root}>
      <Button
        aria-pressed={selected}
        cursor={disabled === true ? 'not-allowed' : 'pointer'}
        disabled={disabled}
        onClick={onClick}
        opacity={disabled === true ? 0.4 : 1}
        _hover={hover}
        unstyled
        {...layout.button}
      >
        <Box borderColor={borderColor} data-stitch-line-visual="" {...layout.visual} />
      </Button>
    </Box>
  )
}

const CORNER_BORDER_WIDTH: CssProperties['borderWidth'] = 'medium'
const CORNER_SEGMENT_SIZE: Tokens['sizes'] = '10'
const CORNER_HIT_SLOP: Tokens['spacing'] = '4'
const NEGATIVE_CORNER_HIT_SLOP: Tokens['spacing'] = `-${CORNER_HIT_SLOP}` as Tokens['spacing']
const CORNER_INSET: Tokens['sizes'] = 'md'
const CORNER_RADIUS: Tokens['radii'] = 'md'

const getCornerLayout = (corner: StitchCornerSchema): StitchLineSegmentLayout => {
  const layouts: Record<StitchCornerSchema, StitchLineSegmentLayout> = {
    'bottom-left': {
      button: {
        bottom: NEGATIVE_CORNER_HIT_SLOP,
        left: NEGATIVE_CORNER_HIT_SLOP,
        position: 'absolute',
        right: 0,
        top: 0,
      },
      root: {
        alignSelf: 'end',
        gridArea: 'bottom-left',
        height: CORNER_SEGMENT_SIZE,
        justifySelf: 'start',
        marginBottom: CORNER_INSET,
        marginLeft: CORNER_INSET,
        marginRight: 0,
        marginTop: 0,
        position: 'relative',
        width: CORNER_SEGMENT_SIZE,
      },
      visual: {
        borderBottomLeftRadius: CORNER_RADIUS,
        borderBottomWidth: CORNER_BORDER_WIDTH,
        borderLeftWidth: CORNER_BORDER_WIDTH,
        height: CORNER_SEGMENT_SIZE,
        left: CORNER_HIT_SLOP,
        position: 'absolute',
        top: 0,
        width: CORNER_SEGMENT_SIZE,
      },
    },
    'bottom-right': {
      button: {
        bottom: NEGATIVE_CORNER_HIT_SLOP,
        left: 0,
        position: 'absolute',
        right: NEGATIVE_CORNER_HIT_SLOP,
        top: 0,
      },
      root: {
        alignSelf: 'end',
        gridArea: 'bottom-right',
        height: CORNER_SEGMENT_SIZE,
        justifySelf: 'end',
        marginBottom: CORNER_INSET,
        marginLeft: 0,
        marginRight: CORNER_INSET,
        marginTop: 0,
        position: 'relative',
        width: CORNER_SEGMENT_SIZE,
      },
      visual: {
        borderBottomRightRadius: CORNER_RADIUS,
        borderBottomWidth: CORNER_BORDER_WIDTH,
        borderRightWidth: CORNER_BORDER_WIDTH,
        height: CORNER_SEGMENT_SIZE,
        left: 0,
        position: 'absolute',
        top: 0,
        width: CORNER_SEGMENT_SIZE,
      },
    },
    'top-left': {
      button: {
        bottom: 0,
        left: NEGATIVE_CORNER_HIT_SLOP,
        position: 'absolute',
        right: 0,
        top: NEGATIVE_CORNER_HIT_SLOP,
      },
      root: {
        alignSelf: 'start',
        gridArea: 'top-left',
        height: CORNER_SEGMENT_SIZE,
        justifySelf: 'start',
        marginBottom: 0,
        marginLeft: CORNER_INSET,
        marginRight: 0,
        marginTop: CORNER_INSET,
        position: 'relative',
        width: CORNER_SEGMENT_SIZE,
      },
      visual: {
        borderLeftWidth: CORNER_BORDER_WIDTH,
        borderTopLeftRadius: CORNER_RADIUS,
        borderTopWidth: CORNER_BORDER_WIDTH,
        height: CORNER_SEGMENT_SIZE,
        left: CORNER_HIT_SLOP,
        position: 'absolute',
        top: CORNER_HIT_SLOP,
        width: CORNER_SEGMENT_SIZE,
      },
    },
    'top-right': {
      button: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: NEGATIVE_CORNER_HIT_SLOP,
        top: NEGATIVE_CORNER_HIT_SLOP,
      },
      root: {
        alignSelf: 'start',
        gridArea: 'top-right',
        height: CORNER_SEGMENT_SIZE,
        justifySelf: 'end',
        marginBottom: 0,
        marginLeft: 0,
        marginRight: CORNER_INSET,
        marginTop: CORNER_INSET,
        position: 'relative',
        width: CORNER_SEGMENT_SIZE,
      },
      visual: {
        borderRightWidth: CORNER_BORDER_WIDTH,
        borderTopRightRadius: CORNER_RADIUS,
        borderTopWidth: CORNER_BORDER_WIDTH,
        height: CORNER_SEGMENT_SIZE,
        left: 0,
        position: 'absolute',
        top: CORNER_HIT_SLOP,
        width: CORNER_SEGMENT_SIZE,
      },
    },
  }

  return layouts[corner]
}
