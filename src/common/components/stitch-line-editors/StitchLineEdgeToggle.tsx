import { Box, type CssProperties, type SystemStyleObject, type Tokens } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { useEditorContext } from '../../contexts/EditorContext'

import type { StitchSideSchema } from '../../schemas/stitching'
import { EditorButton } from '../common/EditorButton'
import { Tooltip } from '../common/Tooltip'
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
  disabled: boolean
  onClick: () => void
  selected: boolean
  side: StitchSideSchema
  tooltip: string
}

export const StitchLineEdgeToggle: FC<StitchLineEdgeToggleProps> = ({ disabled, onClick, selected, side, tooltip }) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const handleClick = useCallback((): void => {
    setEditingInputId(undefined)
    onClick()
  }, [onClick, setEditingInputId])
  const layout = useMemo<StitchLineSegmentLayout>(() => getSideLayout(side), [side])

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
    <Tooltip content={tooltip}>
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
          <Box borderColor={borderColor} data-stitch-line-visual="" {...layout.visual} />
        </EditorButton>
      </Box>
    </Tooltip>
  )
}

const EDGE_BORDER_WIDTH: CssProperties['borderWidth'] = 'medium'
const EDGE_SEGMENT_SIZE: Tokens['sizes'] = '10'
const EDGE_HIT_SLOP: Tokens['spacing'] = '10'
const EDGE_HIT_AREA_SIZE: Tokens['sizes'] = '20'
const NEGATIVE_EDGE_HIT_SLOP: Tokens['spacing'] = `-${EDGE_HIT_SLOP}` as Tokens['spacing']

const getSideLayout = (side: StitchSideSchema): StitchLineSegmentLayout => {
  const layouts: Record<StitchSideSchema, StitchLineSegmentLayout> = {
    bottom: {
      button: { bottom: NEGATIVE_EDGE_HIT_SLOP, height: EDGE_HIT_AREA_SIZE, left: 0, position: 'absolute', right: 0 },
      root: {
        alignSelf: 'end',
        gridArea: 'bottom',
        height: EDGE_SEGMENT_SIZE,
        justifySelf: 'stretch',
        position: 'relative',
        width: '100%',
      },
      visual: {
        borderBottomWidth: EDGE_BORDER_WIDTH,
        bottom: EDGE_HIT_SLOP,
        height: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
      },
    },
    left: {
      button: { bottom: 0, left: NEGATIVE_EDGE_HIT_SLOP, position: 'absolute', top: 0, width: EDGE_HIT_AREA_SIZE },
      root: {
        alignSelf: 'stretch',
        gridArea: 'left',
        height: '100%',
        justifySelf: 'start',
        position: 'relative',
        width: EDGE_SEGMENT_SIZE,
      },
      visual: {
        borderLeftWidth: EDGE_BORDER_WIDTH,
        height: '100%',
        left: EDGE_HIT_SLOP,
        position: 'absolute',
        top: 0,
        width: 0,
      },
    },
    right: {
      button: { bottom: 0, position: 'absolute', right: NEGATIVE_EDGE_HIT_SLOP, top: 0, width: EDGE_HIT_AREA_SIZE },
      root: {
        alignSelf: 'stretch',
        gridArea: 'right',
        height: '100%',
        justifySelf: 'end',
        position: 'relative',
        width: EDGE_SEGMENT_SIZE,
      },
      visual: {
        borderRightWidth: EDGE_BORDER_WIDTH,
        height: '100%',
        right: EDGE_HIT_SLOP,
        position: 'absolute',
        top: 0,
        width: 0,
      },
    },
    top: {
      button: { height: EDGE_HIT_AREA_SIZE, left: 0, position: 'absolute', right: 0, top: NEGATIVE_EDGE_HIT_SLOP },
      root: {
        alignSelf: 'start',
        gridArea: 'top',
        height: EDGE_SEGMENT_SIZE,
        justifySelf: 'stretch',
        position: 'relative',
        width: '100%',
      },
      visual: {
        borderTopWidth: EDGE_BORDER_WIDTH,
        height: 0,
        left: 0,
        position: 'absolute',
        top: EDGE_HIT_SLOP,
        width: '100%',
      },
    },
  }

  return layouts[side]
}
