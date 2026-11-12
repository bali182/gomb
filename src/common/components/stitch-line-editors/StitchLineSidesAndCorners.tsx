import { Grid } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import {
  canToggleStitchLineSideOrCorner,
  normalizeStitchLineSidesAndCorners,
  STITCH_LINE_SIDE_AND_CORNER_ORDER,
  type StitchLineSideOrCornerField,
} from '../../logic/stitching/stitchLineSidesAndCorners'
import type { EditableSchema } from '../../schemas/editable'
import type { ComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { StitchLineCornerToggle } from './StitchLineCornerToggle'
import { StitchLineEdgeToggle } from './StitchLineEdgeToggle'
import { StitchLineEditorsOverlay } from './StitchLineEditorsOverlay'
import {
  getStitchLineOffsetCanonicalEndpoint,
  getStitchLineOffsetPosition,
  type StitchLineOffsetEndpoint,
} from './stitchLineOffsetEditorUtils'
import { STITCH_LINE_PADDING_X, STITCH_LINE_PADDING_Y } from './stitchLineSidesAndCornersLayout'

type StitchLineSidesAndCornersProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
  startOffsetEditor?: ReactNode
  endOffsetEditor?: ReactNode
  directionEditor?: ReactNode
}

export const StitchLineSidesAndCorners: FC<StitchLineSidesAndCornersProps> = ({
  editable,
  onChange,
  startOffsetEditor,
  endOffsetEditor,
  directionEditor,
}) => {
  const { t } = useTranslation()
  const isClosed = useMemo<boolean>(
    () => STITCH_LINE_SIDE_AND_CORNER_ORDER.every((field) => editable[field]),
    [editable],
  )
  const startPosition = useMemo<StitchLineSideOrCornerField | undefined>(
    () => getStitchLineOffsetPosition(editable, 'start'),
    [editable],
  )
  const endPosition = useMemo<StitchLineSideOrCornerField | undefined>(
    () => getStitchLineOffsetPosition(editable, 'end'),
    [editable],
  )
  const startCanonicalEndpoint = getStitchLineOffsetCanonicalEndpoint(editable.stitchDirection, 'start')
  const endCanonicalEndpoint = getStitchLineOffsetCanonicalEndpoint(editable.stitchDirection, 'end')
  const getEndpointMarker = useCallback(
    (
      field: StitchLineSideOrCornerField,
      canonicalEndpoint: StitchLineOffsetEndpoint,
    ): StitchLineOffsetEndpoint | undefined => {
      if (isClosed) {
        if (
          (field === 'top' && canonicalEndpoint === 'start') ||
          (field === 'topLeftCorner' && canonicalEndpoint === 'end')
        ) {
          return canonicalEndpoint === startCanonicalEndpoint ? 'start' : 'end'
        }
        return undefined
      }
      if (field === startPosition && canonicalEndpoint === startCanonicalEndpoint) {
        return 'start'
      }
      if (field === endPosition && canonicalEndpoint === endCanonicalEndpoint) {
        return 'end'
      }
      return undefined
    },
    [isClosed, startPosition, endPosition, startCanonicalEndpoint, endCanonicalEndpoint],
  )
  const toggle = useCallback(
    (field: StitchLineSideOrCornerField): void => {
      if (canToggleStitchLineSideOrCorner(editable, field)) {
        onChange(normalizeStitchLineSidesAndCorners({ ...editable, [field]: !editable[field] }))
      }
    },
    [editable, onChange],
  )
  return (
    <Grid
      aspectRatio="4 / 3"
      gap="2"
      gridTemplateAreas={`"top-left top top-right" "left center right" "bottom-left bottom bottom-right"`}
      gridTemplateColumns="auto minmax(0, 1fr) auto"
      gridTemplateRows="auto minmax(0, 1fr) auto"
      position="relative"
      width="100%"
      minWidth="0"
      minHeight="64"
      px={STITCH_LINE_PADDING_X}
      py={STITCH_LINE_PADDING_Y}
    >
      <StitchLineCornerToggle
        corner="top-left"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'topLeftCorner')}
        selected={editable.topLeftCorner}
        startMarker={getEndpointMarker('topLeftCorner', 'start')}
        endMarker={getEndpointMarker('topLeftCorner', 'end')}
        onClick={() => toggle('topLeftCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.topLeftCorner.tooltip}
      />
      <StitchLineEdgeToggle
        side="top"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'top')}
        selected={editable.top}
        startMarker={getEndpointMarker('top', 'start')}
        endMarker={getEndpointMarker('top', 'end')}
        onClick={() => toggle('top')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.top.tooltip}
      />
      <StitchLineCornerToggle
        corner="top-right"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'topRightCorner')}
        selected={editable.topRightCorner}
        startMarker={getEndpointMarker('topRightCorner', 'start')}
        endMarker={getEndpointMarker('topRightCorner', 'end')}
        onClick={() => toggle('topRightCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.topRightCorner.tooltip}
      />
      <StitchLineEdgeToggle
        side="left"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'left')}
        selected={editable.left}
        startMarker={getEndpointMarker('left', 'start')}
        endMarker={getEndpointMarker('left', 'end')}
        onClick={() => toggle('left')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.left.tooltip}
      />
      <StitchLineEdgeToggle
        side="right"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'right')}
        selected={editable.right}
        startMarker={getEndpointMarker('right', 'start')}
        endMarker={getEndpointMarker('right', 'end')}
        onClick={() => toggle('right')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.right.tooltip}
      />
      <StitchLineCornerToggle
        corner="bottom-left"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'bottomLeftCorner')}
        selected={editable.bottomLeftCorner}
        startMarker={getEndpointMarker('bottomLeftCorner', 'start')}
        endMarker={getEndpointMarker('bottomLeftCorner', 'end')}
        onClick={() => toggle('bottomLeftCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.bottomLeftCorner.tooltip}
      />
      <StitchLineEdgeToggle
        side="bottom"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'bottom')}
        selected={editable.bottom}
        startMarker={getEndpointMarker('bottom', 'start')}
        endMarker={getEndpointMarker('bottom', 'end')}
        onClick={() => toggle('bottom')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.bottom.tooltip}
      />
      <StitchLineCornerToggle
        corner="bottom-right"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'bottomRightCorner')}
        selected={editable.bottomRightCorner}
        startMarker={getEndpointMarker('bottomRightCorner', 'start')}
        endMarker={getEndpointMarker('bottomRightCorner', 'end')}
        onClick={() => toggle('bottomRightCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.bottomRightCorner.tooltip}
      />
      <StitchLineEditorsOverlay
        editable={editable}
        startOffsetEditor={startOffsetEditor}
        endOffsetEditor={endOffsetEditor}
        directionEditor={directionEditor}
      />
    </Grid>
  )
}
