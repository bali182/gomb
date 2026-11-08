import { Box, Grid, HStack, SystemStyleObject, type Tokens } from '@chakra-ui/react'
import { useMemo, type FC, type ReactNode } from 'react'
import {
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
  type StitchLineSideOrCornerField,
} from '../../logic/stitching/stitchLineSidesAndCorners'
import type { EditableSchema } from '../../schemas/editable'
import type { ComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import type { NumberInputArrowPosition } from '../common/NumberInputArrow'

export type StitchLineOffsetEditorRenderer = (arrowPosition: NumberInputArrowPosition | undefined) => ReactNode

type StitchLineEditorsOverlayProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  startOffsetEditor?: StitchLineOffsetEditorRenderer
  endOffsetEditor?: StitchLineOffsetEditorRenderer
  directionEditor?: ReactNode
}

export const StitchLineEditorsOverlay: FC<StitchLineEditorsOverlayProps> = ({
  editable,
  startOffsetEditor,
  endOffsetEditor,
  directionEditor,
}) => {
  const startPosition = useMemo<StitchLineSideOrCornerField | undefined>(() => {
    const startField = STITCH_LINE_SIDE_AND_CORNER_ORDER.find((field, index, fields) => {
      const previous = fields[(index + fields.length - 1) % fields.length]
      return editable[field] && !editable[previous]
    })
    if (isDefined(startField)) {
      return startField
    }
    if (editable.top) {
      return 'top'
    }
    return undefined
  }, [editable])

  const endPosition = useMemo<StitchLineSideOrCornerField | undefined>(() => {
    const endField = STITCH_LINE_SIDE_AND_CORNER_ORDER.find((field, index, fields) => {
      const next = fields[(index + 1) % fields.length]
      return editable[field] && !editable[next]
    })
    if (isDefined(endField)) {
      return endField
    }
    if (editable.topLeftCorner) {
      return 'topLeftCorner'
    }
    return undefined
  }, [editable])

  const isClosed = useMemo<boolean>(
    () => STITCH_LINE_SIDE_AND_CORNER_ORDER.every((field) => editable[field]),
    [editable],
  )

  const samePosition =
    isDefined(startOffsetEditor) &&
    isDefined(endOffsetEditor) &&
    isDefined(startPosition) &&
    startPosition === endPosition

  const sharedCorner =
    samePosition &&
    startPosition !== 'top' &&
    startPosition !== 'right' &&
    startPosition !== 'bottom' &&
    startPosition !== 'left'
  const startLayout = isDefined(startPosition) ? STITCH_LINE_OFFSET_LAYOUTS[startPosition] : undefined
  const endLayout = isDefined(endPosition) ? STITCH_LINE_OFFSET_LAYOUTS[endPosition] : undefined
  const sharedStartArrow = startPosition === 'topLeftCorner' || startPosition === 'bottomRightCorner'

  return (
    <Grid
      position="absolute"
      inset="0"
      px="10"
      py="7"
      minWidth="0"
      gridTemplateAreas={`"top-left top top-right" "left center right" "bottom-left bottom bottom-right"`}
      gridTemplateColumns="minmax(0, 1fr) max-content minmax(0, 1fr)"
      gridTemplateRows="minmax(0, 1fr) max-content minmax(0, 1fr)"
      pointerEvents="none"
    >
      <Box gridArea="center" placeSelf="center" width="max-content" pointerEvents="auto">
        {directionEditor}
      </Box>
      {sharedCorner && isDefined(startPosition) && isDefined(startLayout) && (
        <Box gridArea={startLayout.area} {...startLayout.container}>
          <HStack
            gap="2"
            alignItems="start"
            pointerEvents="auto"
            flexDirection={
              startPosition === 'bottomLeftCorner' || startPosition === 'bottomRightCorner' ? 'row-reverse' : 'row'
            }
          >
            {startOffsetEditor?.(sharedStartArrow ? STITCH_LINE_OFFSET_ARROW_POSITIONS[startPosition] : undefined)}
            {endOffsetEditor?.(sharedStartArrow ? undefined : STITCH_LINE_OFFSET_ARROW_POSITIONS[startPosition])}
          </HStack>
        </Box>
      )}
      {!sharedCorner && isDefined(startPosition) && isDefined(startLayout) && isDefined(startOffsetEditor) && (
        <Box
          gridArea={isClosed ? startLayout.area : startLayout.startArea}
          {...(isClosed ? startLayout.container : startLayout.startContainer)}
        >
          {startOffsetEditor(STITCH_LINE_OFFSET_ARROW_POSITIONS[startPosition])}
        </Box>
      )}
      {!sharedCorner && isDefined(endPosition) && isDefined(endLayout) && isDefined(endOffsetEditor) && (
        <Box gridArea={endLayout.endArea} {...endLayout.endContainer}>
          {endOffsetEditor(STITCH_LINE_OFFSET_ARROW_POSITIONS[endPosition])}
        </Box>
      )}
    </Grid>
  )
}

type StitchLineOffsetLayout = {
  area: string
  startArea: string
  endArea: string
  container: SystemStyleObject
  startContainer: SystemStyleObject
  endContainer: SystemStyleObject
}

const STITCH_LINE_OFFSET_EDITOR_INSET: Tokens['spacing'] = '11'

const STITCH_LINE_OFFSET_ARROW_POSITIONS: Record<StitchLineSideOrCornerField, NumberInputArrowPosition> = {
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  topLeftCorner: 'top-left',
  topRightCorner: 'top-right',
  bottomLeftCorner: 'bottom-left',
  bottomRightCorner: 'bottom-right',
}

const STITCH_LINE_OFFSET_LAYOUTS: Record<StitchLineSideOrCornerField, StitchLineOffsetLayout> = {
  top: {
    area: 'top',
    startArea: 'top-left',
    endArea: 'top-right',
    container: { alignSelf: 'start', justifySelf: 'center' },
    startContainer: { alignSelf: 'start', justifySelf: 'start', marginLeft: STITCH_LINE_OFFSET_EDITOR_INSET },
    endContainer: { alignSelf: 'start', justifySelf: 'end', marginRight: STITCH_LINE_OFFSET_EDITOR_INSET },
  },
  right: {
    area: 'right',
    startArea: 'top-right',
    endArea: 'bottom-right',
    container: { alignSelf: 'center', justifySelf: 'end' },
    startContainer: { alignSelf: 'start', justifySelf: 'end', marginTop: STITCH_LINE_OFFSET_EDITOR_INSET },
    endContainer: { alignSelf: 'end', justifySelf: 'end', marginBottom: STITCH_LINE_OFFSET_EDITOR_INSET },
  },
  bottom: {
    area: 'bottom',
    startArea: 'bottom-right',
    endArea: 'bottom-left',
    container: { alignSelf: 'end', justifySelf: 'center' },
    startContainer: { alignSelf: 'end', justifySelf: 'end', marginRight: STITCH_LINE_OFFSET_EDITOR_INSET },
    endContainer: { alignSelf: 'end', justifySelf: 'start', marginLeft: STITCH_LINE_OFFSET_EDITOR_INSET },
  },
  left: {
    area: 'left',
    startArea: 'bottom-left',
    endArea: 'top-left',
    container: { alignSelf: 'center', justifySelf: 'start' },
    startContainer: { alignSelf: 'end', justifySelf: 'start', marginBottom: STITCH_LINE_OFFSET_EDITOR_INSET },
    endContainer: { alignSelf: 'start', justifySelf: 'start', marginTop: STITCH_LINE_OFFSET_EDITOR_INSET },
  },
  topLeftCorner: {
    area: 'top-left',
    startArea: 'top-left',
    endArea: 'top-left',
    container: { alignSelf: 'start', justifySelf: 'start' },
    startContainer: { alignSelf: 'start', justifySelf: 'start' },
    endContainer: { alignSelf: 'start', justifySelf: 'start' },
  },
  topRightCorner: {
    area: 'top-right',
    startArea: 'top-right',
    endArea: 'top-right',
    container: { alignSelf: 'start', justifySelf: 'end' },
    startContainer: { alignSelf: 'start', justifySelf: 'end' },
    endContainer: { alignSelf: 'start', justifySelf: 'end' },
  },
  bottomLeftCorner: {
    area: 'bottom-left',
    startArea: 'bottom-left',
    endArea: 'bottom-left',
    container: { alignSelf: 'end', justifySelf: 'start' },
    startContainer: { alignSelf: 'end', justifySelf: 'start' },
    endContainer: { alignSelf: 'end', justifySelf: 'start' },
  },
  bottomRightCorner: {
    area: 'bottom-right',
    startArea: 'bottom-right',
    endArea: 'bottom-right',
    container: { alignSelf: 'end', justifySelf: 'end' },
    startContainer: { alignSelf: 'end', justifySelf: 'end' },
    endContainer: { alignSelf: 'end', justifySelf: 'end' },
  },
}
