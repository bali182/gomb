import { Box, Grid } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'

import type { EditableSchema } from '../../schemas/editable'
import type { ComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { StitchLineCornerToggle } from './StitchLineCornerToggle'
import { StitchLineDirectionSwitch } from './StitchLineDirectionSwitch'
import { StitchLineDisconnectedCornerSwitch } from './StitchLineDisconnectedCornerSwitch'
import { StitchLineEdgeToggle } from './StitchLineEdgeToggle'
import { StitchLineOffsetInput, type StitchLineOffsetField } from './StitchLineOffsetInput'

type StitchLineSidesAndCornersProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  issues: ValidationIssuesSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
}

type StitchLineSideFields = 'top' | 'right' | 'bottom' | 'left'
type StitchLineCornerFields = 'topLeftCorner' | 'topRightCorner' | 'bottomRightCorner' | 'bottomLeftCorner'
type StitchLineDisconnectedCornerFields =
  | 'stitchDisconnectedTopLeftCorner'
  | 'stitchDisconnectedTopRightCorner'
  | 'stitchDisconnectedBottomRightCorner'
  | 'stitchDisconnectedBottomLeftCorner'
type StitchLineSideOrCornerFields = StitchLineCornerFields | StitchLineSideFields

type StitchLineSideCornersSchema = {
  first: StitchLineCornerFields
  second: StitchLineCornerFields
}

type StitchLineOffsetConnectionSchema = {
  corner: StitchLineCornerFields
  side: StitchLineSideFields
}

type CornerSidesSchema = {
  first: StitchLineSideFields
  second: StitchLineSideFields
}

const cornerSides: Record<StitchLineCornerFields, CornerSidesSchema> = {
  bottomLeftCorner: { first: 'bottom', second: 'left' },
  bottomRightCorner: { first: 'bottom', second: 'right' },
  topLeftCorner: { first: 'top', second: 'left' },
  topRightCorner: { first: 'top', second: 'right' },
}

const disconnectedCornerFields: Record<StitchLineCornerFields, StitchLineDisconnectedCornerFields> = {
  bottomLeftCorner: 'stitchDisconnectedBottomLeftCorner',
  bottomRightCorner: 'stitchDisconnectedBottomRightCorner',
  topLeftCorner: 'stitchDisconnectedTopLeftCorner',
  topRightCorner: 'stitchDisconnectedTopRightCorner',
}

const sideCorners: Record<StitchLineSideFields, StitchLineSideCornersSchema> = {
  bottom: { first: 'bottomLeftCorner', second: 'bottomRightCorner' },
  left: { first: 'bottomLeftCorner', second: 'topLeftCorner' },
  right: { first: 'bottomRightCorner', second: 'topRightCorner' },
  top: { first: 'topLeftCorner', second: 'topRightCorner' },
}

const offsetConnections: Record<StitchLineOffsetField, StitchLineOffsetConnectionSchema> = {
  bottomEndOffset: { corner: 'bottomLeftCorner', side: 'bottom' },
  bottomStartOffset: { corner: 'bottomRightCorner', side: 'bottom' },
  leftEndOffset: { corner: 'topLeftCorner', side: 'left' },
  leftStartOffset: { corner: 'bottomLeftCorner', side: 'left' },
  rightEndOffset: { corner: 'bottomRightCorner', side: 'right' },
  rightStartOffset: { corner: 'topRightCorner', side: 'right' },
  topEndOffset: { corner: 'topRightCorner', side: 'top' },
  topStartOffset: { corner: 'topLeftCorner', side: 'top' },
}

export const StitchLineSidesAndCorners: FC<StitchLineSidesAndCornersProps> = ({ editable, issues, onChange }) => {
  const toggle = useCallback(
    (field: StitchLineSideOrCornerFields): void => {
      onChange({ ...editable, [field]: !editable[field] })
    },
    [editable, onChange],
  )

  const isCornerDisabled = useCallback(
    (corner: StitchLineCornerFields): boolean => {
      const sides = cornerSides[corner]

      return !editable[sides.first] && !editable[sides.second]
    },
    [editable],
  )

  const isDirectionDisabled = useCallback(
    (side: StitchLineSideFields): boolean => {
      const corners = sideCorners[side]

      return !editable[side] || editable[corners.first] || editable[corners.second]
    },
    [editable],
  )

  const isDisconnectedCornerDisabled = useCallback(
    (corner: StitchLineCornerFields): boolean => {
      const sides = cornerSides[corner]

      return editable[corner] || !editable[sides.first] || !editable[sides.second]
    },
    [editable],
  )

  const isOffsetDisabled = useCallback(
    (field: StitchLineOffsetField): boolean => {
      const connection = offsetConnections[field]

      return !editable[connection.side] || editable[connection.corner]
    },
    [editable],
  )

  const handleOffsetChange = useCallback(
    (field: StitchLineOffsetField, value: string): void => {
      onChange({ ...editable, [field]: value })
    },
    [editable, onChange],
  )

  const handleDisconnectedCornerChange = useCallback(
    (field: StitchLineDisconnectedCornerFields, checked: boolean): void => {
      onChange({ ...editable, [field]: checked })
    },
    [editable, onChange],
  )

  return (
    <Grid
      gap="2"
      gridTemplateAreas={`
        ". left-start-offset top-direction right-start-offset ."
        "top-start-offset canvas canvas canvas top-end-offset"
        "left-direction canvas canvas canvas right-direction"
        "bottom-start-offset canvas canvas canvas bottom-end-offset"
        ". left-end-offset bottom-direction right-end-offset ."
      `}
      gridTemplateColumns="auto auto minmax(0, 1fr) auto auto"
      gridTemplateRows="auto auto auto auto auto"
    >
      <Grid
        aspectRatio="4 / 3"
        gap="0"
        gridArea="canvas"
        gridTemplateAreas={`
          "top-left top top-right"
          "left center right"
          "bottom-left bottom bottom-right"
        `}
        gridTemplateColumns="auto minmax(0, 1fr) auto"
        gridTemplateRows="auto minmax(0, 1fr) auto"
        position="relative"
      >
        <StitchLineCornerToggle
          corner="top-left"
          disabled={isCornerDisabled('topLeftCorner')}
          selected={editable.topLeftCorner}
          onClick={() => toggle('topLeftCorner')}
        />
        <StitchLineEdgeToggle selected={editable.top} side="top" onClick={() => toggle('top')} />
        <StitchLineCornerToggle
          corner="top-right"
          disabled={isCornerDisabled('topRightCorner')}
          selected={editable.topRightCorner}
          onClick={() => toggle('topRightCorner')}
        />
        <StitchLineEdgeToggle selected={editable.left} side="left" onClick={() => toggle('left')} />
        <Box gridArea="center" />
        <StitchLineEdgeToggle selected={editable.right} side="right" onClick={() => toggle('right')} />
        <StitchLineCornerToggle
          corner="bottom-left"
          disabled={isCornerDisabled('bottomLeftCorner')}
          selected={editable.bottomLeftCorner}
          onClick={() => toggle('bottomLeftCorner')}
        />
        <StitchLineEdgeToggle selected={editable.bottom} side="bottom" onClick={() => toggle('bottom')} />
        <StitchLineCornerToggle
          corner="bottom-right"
          disabled={isCornerDisabled('bottomRightCorner')}
          selected={editable.bottomRightCorner}
          onClick={() => toggle('bottomRightCorner')}
        />
        <StitchLineDisconnectedCornerSwitch
          checked={editable[disconnectedCornerFields.topLeftCorner]}
          corner="top-left"
          disabled={isDisconnectedCornerDisabled('topLeftCorner')}
          onCheckedChange={(checked) => handleDisconnectedCornerChange(disconnectedCornerFields.topLeftCorner, checked)}
        />
        <StitchLineDisconnectedCornerSwitch
          checked={editable[disconnectedCornerFields.topRightCorner]}
          corner="top-right"
          disabled={isDisconnectedCornerDisabled('topRightCorner')}
          onCheckedChange={(checked) =>
            handleDisconnectedCornerChange(disconnectedCornerFields.topRightCorner, checked)
          }
        />
        <StitchLineDisconnectedCornerSwitch
          checked={editable[disconnectedCornerFields.bottomLeftCorner]}
          corner="bottom-left"
          disabled={isDisconnectedCornerDisabled('bottomLeftCorner')}
          onCheckedChange={(checked) =>
            handleDisconnectedCornerChange(disconnectedCornerFields.bottomLeftCorner, checked)
          }
        />
        <StitchLineDisconnectedCornerSwitch
          checked={editable[disconnectedCornerFields.bottomRightCorner]}
          corner="bottom-right"
          disabled={isDisconnectedCornerDisabled('bottomRightCorner')}
          onCheckedChange={(checked) =>
            handleDisconnectedCornerChange(disconnectedCornerFields.bottomRightCorner, checked)
          }
        />
      </Grid>
      <StitchLineDirectionSwitch
        checked={editable.topStitchDirection === 'left-to-right'}
        disabled={isDirectionDisabled('top')}
        side="top"
        onCheckedChange={(checked) =>
          onChange({ ...editable, topStitchDirection: checked ? 'left-to-right' : 'right-to-left' })
        }
      />
      <StitchLineDirectionSwitch
        checked={editable.rightStitchDirection === 'top-to-bottom'}
        disabled={isDirectionDisabled('right')}
        side="right"
        onCheckedChange={(checked) =>
          onChange({ ...editable, rightStitchDirection: checked ? 'top-to-bottom' : 'bottom-to-top' })
        }
      />
      <StitchLineDirectionSwitch
        checked={editable.bottomStitchDirection === 'right-to-left'}
        disabled={isDirectionDisabled('bottom')}
        side="bottom"
        onCheckedChange={(checked) =>
          onChange({ ...editable, bottomStitchDirection: checked ? 'right-to-left' : 'left-to-right' })
        }
      />
      <StitchLineDirectionSwitch
        checked={editable.leftStitchDirection === 'bottom-to-top'}
        disabled={isDirectionDisabled('left')}
        side="left"
        onCheckedChange={(checked) =>
          onChange({ ...editable, leftStitchDirection: checked ? 'bottom-to-top' : 'top-to-bottom' })
        }
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('leftStartOffset')}
        field="leftStartOffset"
        issue={issues.leftStartOffset}
        value={editable.leftStartOffset}
        onChange={(value) => handleOffsetChange('leftStartOffset', value)}
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('topStartOffset')}
        field="topStartOffset"
        issue={issues.topStartOffset}
        value={editable.topStartOffset}
        onChange={(value) => handleOffsetChange('topStartOffset', value)}
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('topEndOffset')}
        field="topEndOffset"
        issue={issues.topEndOffset}
        value={editable.topEndOffset}
        onChange={(value) => handleOffsetChange('topEndOffset', value)}
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('rightStartOffset')}
        field="rightStartOffset"
        issue={issues.rightStartOffset}
        value={editable.rightStartOffset}
        onChange={(value) => handleOffsetChange('rightStartOffset', value)}
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('rightEndOffset')}
        field="rightEndOffset"
        issue={issues.rightEndOffset}
        value={editable.rightEndOffset}
        onChange={(value) => handleOffsetChange('rightEndOffset', value)}
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('bottomStartOffset')}
        field="bottomStartOffset"
        issue={issues.bottomStartOffset}
        value={editable.bottomStartOffset}
        onChange={(value) => handleOffsetChange('bottomStartOffset', value)}
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('bottomEndOffset')}
        field="bottomEndOffset"
        issue={issues.bottomEndOffset}
        value={editable.bottomEndOffset}
        onChange={(value) => handleOffsetChange('bottomEndOffset', value)}
      />
      <StitchLineOffsetInput
        disabled={isOffsetDisabled('leftEndOffset')}
        field="leftEndOffset"
        issue={issues.leftEndOffset}
        value={editable.leftEndOffset}
        onChange={(value) => handleOffsetChange('leftEndOffset', value)}
      />
    </Grid>
  )
}
