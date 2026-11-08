import { Box, Grid, HStack, SystemStyleObject, type Tokens } from '@chakra-ui/react'
import { useMemo, type FC, type ReactNode } from 'react'
import {
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
  type StitchLineSideOrCornerField,
} from '../../logic/stitching/stitchLineSidesAndCorners'
import type { EditableSchema } from '../../schemas/editable'
import type { ComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { getStitchLineOffsetPosition } from './stitchLineOffsetEditorUtils'

type StitchLineEditorsOverlayProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  startOffsetEditor?: ReactNode
  endOffsetEditor?: ReactNode
  directionEditor?: ReactNode
}

export const StitchLineEditorsOverlay: FC<StitchLineEditorsOverlayProps> = ({
  editable,
  startOffsetEditor,
  endOffsetEditor,
  directionEditor,
}) => {
  const startPosition = useMemo<StitchLineSideOrCornerField | undefined>(
    () => getStitchLineOffsetPosition(editable, 'start'),
    [editable],
  )

  const endPosition = useMemo<StitchLineSideOrCornerField | undefined>(
    () => getStitchLineOffsetPosition(editable, 'end'),
    [editable],
  )

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
            {startOffsetEditor}
            {endOffsetEditor}
          </HStack>
        </Box>
      )}
      {!sharedCorner && isDefined(startPosition) && isDefined(startLayout) && isDefined(startOffsetEditor) && (
        <Box
          gridArea={isClosed ? startLayout.area : startLayout.startArea}
          {...(isClosed ? startLayout.container : startLayout.startContainer)}
        >
          {startOffsetEditor}
        </Box>
      )}
      {!sharedCorner && isDefined(endPosition) && isDefined(endLayout) && isDefined(endOffsetEditor) && (
        <Box gridArea={endLayout.endArea} {...endLayout.endContainer}>
          {endOffsetEditor}
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
