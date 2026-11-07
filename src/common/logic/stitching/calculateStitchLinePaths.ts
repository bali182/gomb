import BigNumber from 'bignumber.js'
import { ZERO } from '../../constants/layout'
import type { StitchPathFragment, StitchSidePathFragment } from '../../schemas/computed'
import type { PathCommand, PathSchema, PointSchema } from '../../schemas/geometry'
import type { ResolvedComponentBoundsStitchLineSchema, StitchSideSchema } from '../../schemas/stitching'
import { clamp } from '../../utils/clamp'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getComponentBoundsStitchLineOffsetLimits } from '../limits/getComponentBoundsStitchLineOffsetLimits'
import { getComponentBoundsStitchLineGeometry } from './getComponentBoundsStitchLineGeometry'
import type { ComponentBoundsStitchLineTarget } from './helperTypes'

export type CalculatedStitchLinePath = {
  path: PathSchema
  fragments: StitchPathFragment[]
  isClosed: boolean
  labelPosition: StitchSideSchema
}

export const calculateStitchLinePath = (
  stitchLine: ResolvedComponentBoundsStitchLineSchema,
  target: ComponentBoundsStitchLineTarget,
): CalculatedStitchLinePath | undefined => {
  const geometry = getComponentBoundsStitchLineGeometry(stitchLine, target)
  const limits = getComponentBoundsStitchLineOffsetLimits(stitchLine, geometry)
  const fragments = [...geometry.fragments]
  if (!geometry.isClosed) {
    const startOffset = clamp(new BigNumber(stitchLine.startOffset), limits.startOffset?.min?.value)
    const endOffset = clamp(new BigNumber(stitchLine.endOffset), limits.endOffset?.min?.value)
    const first = fragments[0]
    const lastIndex = fragments.length - 1
    if (isDefined(first) && narrowers.path.is.sideFragment(first)) {
      fragments[0] = { ...first, start: offsetSideEndpoint(first, first.start, startOffset.negated()) }
    }
    const last = fragments[lastIndex]
    if (isDefined(last) && narrowers.path.is.sideFragment(last)) {
      fragments[lastIndex] = { ...last, end: offsetSideEndpoint(last, last.end, endOffset) }
    }
  }
  if (fragments.length === 0) {
    return undefined
  }
  const reversed = stitchLine.stitchDirection === 'end-to-start'
  const ordered = reversed ? [...fragments].reverse() : fragments
  const commands: PathCommand[] = [{ type: 'moveTo', point: reversed ? ordered[0].end : ordered[0].start }]
  for (const fragment of ordered) {
    const point = reversed ? fragment.start : fragment.end
    if (narrowers.path.is.sideFragment(fragment)) {
      commands.push({ type: 'lineTo', point })
    } else if (fragment.radius.isGreaterThan(ZERO)) {
      commands.push({ type: 'arcTo', radius: fragment.radius, point, reversed })
    }
  }
  if (commands.length === 1) {
    return undefined
  }
  return { ...geometry, fragments, path: { commands } }
}

const offsetSideEndpoint = (fragment: StitchSidePathFragment, point: PointSchema, offset: BigNumber): PointSchema => {
  switch (fragment.side) {
    case 'top':
      return { x: point.x.plus(offset), y: point.y }
    case 'right':
      return { x: point.x, y: point.y.plus(offset) }
    case 'bottom':
      return { x: point.x.minus(offset), y: point.y }
    case 'left':
      return { x: point.x, y: point.y.minus(offset) }
  }
}
