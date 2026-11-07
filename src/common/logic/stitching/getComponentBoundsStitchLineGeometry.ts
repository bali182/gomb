import BigNumber from 'bignumber.js'
import type { StitchPathFragment } from '../../schemas/computed'
import { RectSchema } from '../../schemas/geometry'
import type { ResolvedComponentBoundsStitchLineSchema, StitchSideSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import type { ComponentBoundsStitchLineTarget } from './helperTypes'
import { getStitchLineCornerRadius } from './stitchLineRadiusUtils'
import { normalizeStitchLineSidesAndCorners, STITCH_LINE_SIDE_AND_CORNER_ORDER } from './stitchLineSidesAndCorners'

export type ComponentBoundsStitchLineGeometry = {
  fragments: StitchPathFragment[]
  isClosed: boolean
  labelPosition: StitchSideSchema
}

export const getComponentBoundsStitchLineGeometry = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): ComponentBoundsStitchLineGeometry => {
  const normalized = normalizeStitchLineSidesAndCorners(stitchLine)
  const margin = new BigNumber(stitchLine.stitchMargin)
  const boundingRect = getStitchLineBoundingRect(target, margin, stitchLine.targetType)
  const radius = getStitchLineCornerRadius(stitchLine, target)

  const left = boundingRect.x
  const top = boundingRect.y
  const right = boundingRect.x.plus(boundingRect.width)
  const bottom = boundingRect.y.plus(boundingRect.height)

  const fragments: StitchPathFragment[] = [
    {
      type: 'side',
      side: 'top',
      start: {
        x: left.plus(radius.topLeft),
        y: top,
      },
      end: {
        x: right.minus(radius.topRight),
        y: top,
      },
    },
    {
      type: 'corner',
      corner: 'top-right',
      radius: radius.topRight,
      start: {
        x: right.minus(radius.topRight),
        y: top,
      },
      end: {
        x: right,
        y: top.plus(radius.topRight),
      },
    },
    {
      type: 'side',
      side: 'right',
      start: {
        x: right,
        y: top.plus(radius.topRight),
      },
      end: {
        x: right,
        y: bottom.minus(radius.bottomRight),
      },
    },
    {
      type: 'corner',
      corner: 'bottom-right',
      radius: radius.bottomRight,
      start: {
        x: right,
        y: bottom.minus(radius.bottomRight),
      },
      end: {
        x: right.minus(radius.bottomRight),
        y: bottom,
      },
    },
    {
      type: 'side',
      side: 'bottom',
      start: {
        x: right.minus(radius.bottomRight),
        y: bottom,
      },
      end: {
        x: left.plus(radius.bottomLeft),
        y: bottom,
      },
    },
    {
      type: 'corner',
      corner: 'bottom-left',
      radius: radius.bottomLeft,
      start: {
        x: left.plus(radius.bottomLeft),
        y: bottom,
      },
      end: {
        x: left,
        y: bottom.minus(radius.bottomLeft),
      },
    },
    {
      type: 'side',
      side: 'left',
      start: {
        x: left,
        y: bottom.minus(radius.bottomLeft),
      },
      end: {
        x: left,
        y: top.plus(radius.topLeft),
      },
    },
    {
      type: 'corner',
      corner: 'top-left',
      radius: radius.topLeft,
      start: {
        x: left,
        y: top.plus(radius.topLeft),
      },
      end: {
        x: left.plus(radius.topLeft),
        y: top,
      },
    },
  ]
  const firstMissingIndex = STITCH_LINE_SIDE_AND_CORNER_ORDER.findIndex((field) => !normalized[field])
  const ordered =
    firstMissingIndex === -1
      ? fragments
      : [...fragments.slice(firstMissingIndex + 1), ...fragments.slice(0, firstMissingIndex + 1)]
  const selected = ordered.filter((fragment) => {
    const index = fragments.indexOf(fragment)
    return normalized[STITCH_LINE_SIDE_AND_CORNER_ORDER[index]]
  })
  return {
    fragments: selected,
    isClosed: firstMissingIndex === -1,
    labelPosition: calculateStitchRouteLabelPosition(selected, firstMissingIndex === -1),
  }
}

const getStitchLineBoundingRect = (
  target: ComponentBoundsStitchLineTarget,
  margin: BigNumber,
  targetType: ResolvedComponentBoundsStitchLineSchema['targetType'],
): RectSchema => {
  switch (targetType) {
    case 'component':
      return {
        x: target.boundingRect.x.plus(margin),
        y: target.boundingRect.y.plus(margin),
        width: target.boundingRect.width.minus(margin.times(2)),
        height: target.boundingRect.height.minus(margin.times(2)),
      }
    case 'hole':
      return {
        x: target.boundingRect.x.minus(margin),
        y: target.boundingRect.y.minus(margin),
        width: target.boundingRect.width.plus(margin.times(2)),
        height: target.boundingRect.height.plus(margin.times(2)),
      }
  }
}

const calculateStitchRouteLabelPosition = (fragments: StitchPathFragment[], isClosed: boolean): StitchSideSchema => {
  if (isClosed) {
    return 'top'
  }

  const sideFragments = fragments.filter(narrowers.path.is.sideFragment)

  switch (sideFragments.length) {
    case 1:
      return sideFragments[0].side
    case 2: {
      const fragment = sideFragments.filter((f) => f.side === 'top' || f.side === 'bottom')[0]
      if (!isDefined(fragment)) {
        throw new Error('No horizontal fragment found')
      }
      return fragment.side
    }
    case 3:
      return sideFragments[1].side
    case 4:
      return 'top'
    case 0: {
      const corner = fragments.find(narrowers.path.is.cornerFragment)
      if (!isDefined(corner)) {
        return 'top'
      }
      switch (corner.corner) {
        case 'top-left':
          return 'top'
        case 'top-right':
          return 'right'
        case 'bottom-right':
          return 'bottom'
        case 'bottom-left':
          return 'left'
      }
    }
    default:
      throw new Error(`Unexpected stitch route side count: ${sideFragments.length}`)
  }
}
