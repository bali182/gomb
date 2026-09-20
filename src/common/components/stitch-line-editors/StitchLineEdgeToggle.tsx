import { Box, Button, type CssProperties, type SystemStyleObject, type Tokens } from '@chakra-ui/react'
import { useMemo, type FC } from 'react'

import type { StitchSideSchema } from '../../schemas/stitching'
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

type StitchLineEdgeToggleProps = {
  onClick: () => void
  selected: boolean
  side: StitchSideSchema
}

export const StitchLineEdgeToggle: FC<StitchLineEdgeToggleProps> = ({ onClick, selected, side }) => {
  const layout = useMemo<StitchLineSegmentLayout>(() => getSideLayout(side), [side])

  const borderColor = useMemo<CssProperties['borderColor']>(
    () => (selected ? SELECTED_BORDER_COLOR : UNSELECTED_BORDER_COLOR),
    [selected],
  )
  const hoverBorderColor = useMemo<CssProperties['borderColor']>(
    () => (selected ? SELECTED_HOVER_BORDER_COLOR : UNSELECTED_HOVER_BORDER_COLOR),
    [selected],
  )
  const hover = useMemo<SystemStyleObject>(
    () => ({ '& > [data-stitch-line-visual]': { borderColor: hoverBorderColor } }),
    [hoverBorderColor],
  )

  return (
    <Box {...layout.root}>
      <Button aria-pressed={selected} cursor="pointer" onClick={onClick} _hover={hover} unstyled {...layout.button}>
        <Box borderColor={borderColor} data-stitch-line-visual="" {...layout.visual} />
      </Button>
    </Box>
  )
}

const EDGE_BORDER_WIDTH: CssProperties['borderWidth'] = 'medium'
const EDGE_SEGMENT_SIZE: Tokens['sizes'] = '10'
const EDGE_HIT_SLOP: Tokens['spacing'] = '4'
const NEGATIVE_EDGE_HIT_SLOP: Tokens['spacing'] = `-${EDGE_HIT_SLOP}` as Tokens['spacing']
const EDGE_INSET: Tokens['sizes'] = 'md'

const getSideLayout = (side: StitchSideSchema): StitchLineSegmentLayout => {
  const layouts: Record<StitchSideSchema, StitchLineSegmentLayout> = {
    bottom: {
      button: { bottom: NEGATIVE_EDGE_HIT_SLOP, left: 0, position: 'absolute', right: 0, top: 0 },
      root: {
        alignSelf: 'end',
        gridArea: 'bottom',
        height: EDGE_SEGMENT_SIZE,
        justifySelf: 'stretch',
        marginBottom: EDGE_INSET,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        position: 'relative',
        width: '100%',
      },
      visual: {
        borderBottomWidth: EDGE_BORDER_WIDTH,
        height: EDGE_SEGMENT_SIZE,
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
      },
    },
    left: {
      button: { bottom: 0, left: NEGATIVE_EDGE_HIT_SLOP, position: 'absolute', right: 0, top: 0 },
      root: {
        alignSelf: 'stretch',
        gridArea: 'left',
        height: '100%',
        justifySelf: 'start',
        marginBottom: 0,
        marginLeft: EDGE_INSET,
        marginRight: 0,
        marginTop: 0,
        position: 'relative',
        width: EDGE_SEGMENT_SIZE,
      },
      visual: {
        borderLeftWidth: EDGE_BORDER_WIDTH,
        height: '100%',
        left: EDGE_HIT_SLOP,
        position: 'absolute',
        top: 0,
        width: EDGE_SEGMENT_SIZE,
      },
    },
    right: {
      button: { bottom: 0, left: 0, position: 'absolute', right: NEGATIVE_EDGE_HIT_SLOP, top: 0 },
      root: {
        alignSelf: 'stretch',
        gridArea: 'right',
        height: '100%',
        justifySelf: 'end',
        marginBottom: 0,
        marginLeft: 0,
        marginRight: EDGE_INSET,
        marginTop: 0,
        position: 'relative',
        width: EDGE_SEGMENT_SIZE,
      },
      visual: {
        borderRightWidth: EDGE_BORDER_WIDTH,
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: EDGE_SEGMENT_SIZE,
      },
    },
    top: {
      button: { bottom: 0, left: 0, position: 'absolute', right: 0, top: NEGATIVE_EDGE_HIT_SLOP },
      root: {
        alignSelf: 'start',
        gridArea: 'top',
        height: EDGE_SEGMENT_SIZE,
        justifySelf: 'stretch',
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: EDGE_INSET,
        position: 'relative',
        width: '100%',
      },
      visual: {
        borderTopWidth: EDGE_BORDER_WIDTH,
        height: EDGE_SEGMENT_SIZE,
        left: 0,
        position: 'absolute',
        top: EDGE_HIT_SLOP,
        width: '100%',
      },
    },
  }

  return layouts[side]
}
