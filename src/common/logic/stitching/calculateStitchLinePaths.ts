import BigNumber from 'bignumber.js'
import { ZERO } from '../../constants/layout'
import type { StitchPathFragment } from '../../schemas/computed'
import type { PathCommand, PathSchema } from '../../schemas/geometry'
import type { ResolvedComponentBoundsStitchLineSchema, StitchSideSchema } from '../../schemas/stitching'
import { clamp } from '../../utils/clamp'
import { narrowers } from '../../utils/narrowers'
import { getComponentBoundsStitchLineOffsetLimits } from '../limits/getComponentBoundsStitchLineOffsetLimits'
import {
  calculateStitchRouteLabelPosition,
  getComponentBoundsStitchLineGeometry,
} from './getComponentBoundsStitchLineGeometry'
import type { ComponentBoundsStitchLineTarget } from './helperTypes'
import { offsetStitchLineFragments } from './offsetStitchLineFragments'
import { getStitchPathFragmentLength } from './stitchLineFragmentGeometry'

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
  let fragments = geometry.fragments
  if (!geometry.isClosed) {
    const startOffset = clamp(new BigNumber(stitchLine.startOffset), limits.startOffset?.min?.value)
    const endOffset = clamp(new BigNumber(stitchLine.endOffset), limits.endOffset?.min?.value)
    fragments =
      stitchLine.stitchDirection === 'start-to-end'
        ? offsetStitchLineFragments(fragments, startOffset, endOffset)
        : offsetStitchLineFragments(fragments, endOffset, startOffset)
  }
  if (!fragments.some((fragment) => getStitchPathFragmentLength(fragment).gt(ZERO))) {
    return undefined
  }
  const reversed = stitchLine.stitchDirection === 'end-to-start'
  const ordered = reversed ? [...fragments].reverse() : fragments
  const commands: PathCommand[] = [{ type: 'moveTo', point: reversed ? ordered[0].end : ordered[0].start }]
  for (const fragment of ordered) {
    const point = reversed ? fragment.start : fragment.end
    if (getStitchPathFragmentLength(fragment).isZero()) {
      continue
    }
    if (narrowers.path.is.sideFragment(fragment)) {
      commands.push({ type: 'lineTo', point })
    } else if (fragment.radius.isGreaterThan(ZERO)) {
      commands.push({ type: 'arcTo', radius: fragment.radius, point, reversed })
    }
  }
  if (commands.length === 1) {
    return undefined
  }
  return {
    ...geometry,
    fragments,
    path: { commands },
    labelPosition: calculateStitchRouteLabelPosition(fragments, geometry.isClosed),
  }
}
