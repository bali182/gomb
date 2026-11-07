import { Grid } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import {
  canToggleStitchLineSideOrCorner,
  normalizeStitchLineSidesAndCorners,
  type StitchLineSideOrCornerField,
} from '../../logic/stitching/stitchLineSidesAndCorners'
import type { EditableSchema } from '../../schemas/editable'
import type { ComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { StitchLineCornerToggle } from './StitchLineCornerToggle'
import { StitchLineEdgeToggle } from './StitchLineEdgeToggle'

type StitchLineSidesAndCornersProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
}

export const StitchLineSidesAndCorners: FC<StitchLineSidesAndCornersProps> = ({ editable, onChange }) => {
  const { t } = useTranslation()
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
      minHeight="280px"
      padding="6"
    >
      <StitchLineCornerToggle
        corner="top-left"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'topLeftCorner')}
        selected={editable.topLeftCorner}
        onClick={() => toggle('topLeftCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.topLeftCorner.tooltip}
      />
      <StitchLineEdgeToggle
        side="top"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'top')}
        selected={editable.top}
        onClick={() => toggle('top')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.top.tooltip}
      />
      <StitchLineCornerToggle
        corner="top-right"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'topRightCorner')}
        selected={editable.topRightCorner}
        onClick={() => toggle('topRightCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.topRightCorner.tooltip}
      />
      <StitchLineEdgeToggle
        side="left"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'left')}
        selected={editable.left}
        onClick={() => toggle('left')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.left.tooltip}
      />
      <StitchLineEdgeToggle
        side="right"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'right')}
        selected={editable.right}
        onClick={() => toggle('right')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.right.tooltip}
      />
      <StitchLineCornerToggle
        corner="bottom-left"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'bottomLeftCorner')}
        selected={editable.bottomLeftCorner}
        onClick={() => toggle('bottomLeftCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.bottomLeftCorner.tooltip}
      />
      <StitchLineEdgeToggle
        side="bottom"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'bottom')}
        selected={editable.bottom}
        onClick={() => toggle('bottom')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.bottom.tooltip}
      />
      <StitchLineCornerToggle
        corner="bottom-right"
        disabled={!canToggleStitchLineSideOrCorner(editable, 'bottomRightCorner')}
        selected={editable.bottomRightCorner}
        onClick={() => toggle('bottomRightCorner')}
        tooltip={t.project.editors.sections.stitchLines.sidesAndCorners.bottomRightCorner.tooltip}
      />
    </Grid>
  )
}
