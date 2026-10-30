import BigNumber from 'bignumber.js'
import { narrowers } from '../../utils/narrowers'

import { ZERO } from '../../constants/layout'
import type { PathCommand, PathSchema, PointSchema } from '../../schemas/geometry'
import type {
  ResolvedComponentBoundsStitchLineSchema,
  StitchCornerSchema,
  StitchSideSchema,
} from '../../schemas/stitching'
import { arePointsEqual } from '../../utils/arePointsEqual'
import { isDefined } from '../../utils/isDefined'
import { ComponentBoundsStitchLineTarget } from './helperTypes'
import { getStitchLineCornerRadius } from './stitchLineRadiusUtils'

export type StitchSidePathFragment = {
  type: 'side'
  side: StitchSideSchema
  start: PointSchema
  end: PointSchema
}

export type StitchCornerPathFragment = {
  type: 'corner'
  corner: StitchCornerSchema
  start: PointSchema
  end: PointSchema
  radius: BigNumber
}

export type StitchPathFragment = StitchSidePathFragment | StitchCornerPathFragment

export type CalculatedStitchLinePath = {
  path: PathSchema
  fragments: StitchPathFragment[]
  isClosed: boolean
  labelPosition: StitchSideSchema
}

type SelectableStitchPathFragment = StitchPathFragment & {
  isSelected: boolean
}

export const calculateStitchLinePaths = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): CalculatedStitchLinePath[] => {
  const fragments = calculateStitchLinePathFragments(stitchLine, target)

  return groupStitchLinePathFragments(fragments)
    .map((routeFragments) => {
      const isClosed = arePointsEqual(routeFragments[0].start, routeFragments[routeFragments.length - 1].end)

      return {
        path: createPathFromFragments(routeFragments),
        fragments: routeFragments,
        isClosed,
        labelPosition: calculateStitchRouteLabelPosition(routeFragments, isClosed),
      }
    })
    .filter((calculatedPath) => calculatedPath.path.commands.length > 1)
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
    default:
      throw new Error(`Unexpected stitch route side count: ${sideFragments.length}`)
  }
}

const calculateStitchLinePathFragments = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): SelectableStitchPathFragment[] => {
  const margin = new BigNumber(stitchLine.stitchMargin)
  const boundingRect = getStitchLineBoundingRect(target, margin, stitchLine.targetType)
  const radius = getStitchLineCornerRadius(stitchLine, target)

  const left = boundingRect.x
  const top = boundingRect.y
  const right = boundingRect.x.plus(boundingRect.width)
  const bottom = boundingRect.y.plus(boundingRect.height)
  const topLeftCorner = stitchLine.topLeftCorner && (stitchLine.top || stitchLine.left)
  const topRightCorner = stitchLine.topRightCorner && (stitchLine.top || stitchLine.right)
  const bottomRightCorner = stitchLine.bottomRightCorner && (stitchLine.right || stitchLine.bottom)
  const bottomLeftCorner = stitchLine.bottomLeftCorner && (stitchLine.bottom || stitchLine.left)

  return [
    {
      type: 'side',
      side: 'top',
      isSelected: stitchLine.top,
      start: {
        x: left.plus(radius.topLeft).minus(topLeftCorner ? ZERO : stitchLine.topStartOffset),
        y: top,
      },
      end: {
        x: right.minus(radius.topRight).plus(topRightCorner ? ZERO : stitchLine.topEndOffset),
        y: top,
      },
    },
    {
      type: 'corner',
      corner: 'top-right',
      isSelected: topRightCorner,
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
      isSelected: stitchLine.right,
      start: {
        x: right,
        y: top.plus(radius.topRight).minus(topRightCorner ? ZERO : stitchLine.rightStartOffset),
      },
      end: {
        x: right,
        y: bottom.minus(radius.bottomRight).plus(bottomRightCorner ? ZERO : stitchLine.rightEndOffset),
      },
    },
    {
      type: 'corner',
      corner: 'bottom-right',
      isSelected: bottomRightCorner,
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
      isSelected: stitchLine.bottom,
      start: {
        x: right.minus(radius.bottomRight).plus(bottomRightCorner ? ZERO : stitchLine.bottomStartOffset),
        y: bottom,
      },
      end: {
        x: left.plus(radius.bottomLeft).minus(bottomLeftCorner ? ZERO : stitchLine.bottomEndOffset),
        y: bottom,
      },
    },
    {
      type: 'corner',
      corner: 'bottom-left',
      isSelected: bottomLeftCorner,
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
      isSelected: stitchLine.left,
      start: {
        x: left,
        y: bottom.minus(radius.bottomLeft).plus(bottomLeftCorner ? ZERO : stitchLine.leftStartOffset),
      },
      end: {
        x: left,
        y: top.plus(radius.topLeft).minus(topLeftCorner ? ZERO : stitchLine.leftEndOffset),
      },
    },
    {
      type: 'corner',
      corner: 'top-left',
      isSelected: topLeftCorner,
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
}

const getStitchLineBoundingRect = (
  target: ComponentBoundsStitchLineTarget,
  margin: BigNumber,
  targetType: ResolvedComponentBoundsStitchLineSchema['targetType'],
): ComponentBoundsStitchLineTarget['boundingRect'] => {
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

const groupStitchLinePathFragments = (fragments: SelectableStitchPathFragment[]): StitchPathFragment[][] => {
  const firstUnselectedFragmentIndex = fragments.findIndex((fragment) => !fragment.isSelected)
  const orderedFragments =
    firstUnselectedFragmentIndex === -1
      ? fragments
      : [...fragments.slice(firstUnselectedFragmentIndex + 1), ...fragments.slice(0, firstUnselectedFragmentIndex + 1)]
  const routes: StitchPathFragment[][] = []
  let currentRoute: StitchPathFragment[] | undefined

  for (const fragment of orderedFragments) {
    if (!fragment.isSelected) {
      currentRoute = undefined
      continue
    }

    if (!isDefined(currentRoute)) {
      currentRoute = []
      routes.push(currentRoute)
    }

    currentRoute.push(fragment)
  }

  return routes
}

const createPathFromFragments = (fragments: StitchPathFragment[]): PathSchema => {
  const commands: PathCommand[] = [{ type: 'moveTo', point: fragments[0].start }]

  for (const fragment of fragments) {
    if (narrowers.path.is.sideFragment(fragment)) {
      commands.push({ type: 'lineTo', point: fragment.end })
      continue
    }

    if (fragment.radius.isGreaterThan(ZERO)) {
      commands.push({ type: 'arcTo', radius: fragment.radius, point: fragment.end, reversed: false })
    }
  }

  return { commands }
}
