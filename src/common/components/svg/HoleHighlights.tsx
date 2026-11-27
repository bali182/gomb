import { useCallback, type FC, type MouseEvent } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { ComputedHoleSchema } from '../../schemas/computed'
import type { DrawAreaHoleStyleParams } from '../../schemas/drawArea'
import type { HoleSchema } from '../../schemas/hole'
import { PureSvgHole } from './PureSvgHole'
import { SelectionPortal } from './SelectionPortal'

type HoleHighlightsProps = {
  componentId: string
}

type HoleHighlightProps = {
  computedHole: ComputedHoleSchema
  hole: HoleSchema
}

export const HoleHighlights: FC<HoleHighlightsProps> = ({ componentId }) => {
  const { computedAccessor, subProject } = useSubProject()
  const holes = subProject.holes.filter((hole) => hole.componentId === componentId)

  return (
    <>
      {holes.map((hole) => {
        const computedHole = computedAccessor.hole.byId(hole.id)

        return <HoleHighlight computedHole={computedHole} hole={hole} key={hole.id} />
      })}
    </>
  )
}

const HoleHighlight: FC<HoleHighlightProps> = ({ computedHole, hole }) => {
  const { holeStyles, selectionStyles, isInteractive, selection } = useDrawAreaContext()
  const { hover, clearHover, select } = selection
  const path = usePath(computedHole.highlightPath)
  const styleParams: DrawAreaHoleStyleParams = { hole }
  const isActive = selection.isSelected(hole) || selection.isHovered(hole)

  const handlePointerEnter = useCallback((): void => {
    hover(hole)
  }, [hole, hover])

  const handlePointerLeave = useCallback((): void => {
    clearHover()
  }, [clearHover])

  const handleClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      select(hole)
    },
    [hole, select],
  )

  if (computedHole.highlightPath.commands.length === 0) {
    return null
  }

  return (
    <>
      <PureSvgHole
        mode={isActive ? 'hit-area' : 'normal'}
        holeId={hole.id}
        path={path}
        boundingRect={computedHole.boundingRect}
        fillColor={holeStyles.getFillColor(styleParams)}
        strokeColor={holeStyles.getStrokeColor(styleParams)}
        strokeWidth={holeStyles.getStrokeThickness(styleParams)}
        selectionColor={selectionStyles.getSelectionColor()}
        disablePointerEvents={!isInteractive}
        cursor={isInteractive ? 'pointer' : undefined}
        onClick={isInteractive ? handleClick : undefined}
        onPointerEnter={isInteractive ? handlePointerEnter : undefined}
        onPointerLeave={isInteractive ? handlePointerLeave : undefined}
      />
      {isActive && (
        <SelectionPortal>
          <PureSvgHole
            mode="selected"
            holeId={hole.id}
            path={path}
            boundingRect={computedHole.boundingRect}
            fillColor={holeStyles.getFillColor(styleParams)}
            strokeColor={holeStyles.getStrokeColor(styleParams)}
            strokeWidth={holeStyles.getStrokeThickness(styleParams)}
            selectionColor={selectionStyles.getSelectionColor()}
          />
        </SelectionPortal>
      )}
    </>
  )
}
