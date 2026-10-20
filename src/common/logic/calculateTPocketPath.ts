import BigNumber from 'bignumber.js'

import type { PocketClusterSchema, PocketOpeningSchema } from '../schemas/components'
import type { PathCommand, PathSchema, RectSchema } from '../schemas/geometry'
import { calculatePocketOpeningPath } from './calculatePocketOpeningPath'
import { getTPocketTabDepth } from './pocketUtils'

export const calculateTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  adjustedOpening: PocketOpeningSchema,
): PathSchema => {
  switch (pocketCluster.orientation) {
    case 'up':
      return calculateUpTPocketPath(rect, pocketCluster, adjustedOpening)
    case 'down':
      return calculateDownTPocketPath(rect, pocketCluster, adjustedOpening)
    case 'left':
      return calculateLeftTPocketPath(rect, pocketCluster, adjustedOpening)
    case 'right':
      return calculateRightTPocketPath(rect, pocketCluster, adjustedOpening)
  }
}

const calculateUpTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  adjustedOpening: PocketOpeningSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabBottomY = top.plus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: left, y: top } },
    ...calculatePocketOpeningPath(adjustedOpening, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: right, y: top } },
    { type: 'lineTo', point: { x: right, y: tabBottomY } },
    { type: 'lineTo', point: { x: right.minus(tPocketTabWidth), y: tabBottomY } },
    { type: 'lineTo', point: { x: right.minus(tPocketTaper), y: bottom } },
    { type: 'lineTo', point: { x: left.plus(tPocketTaper), y: bottom } },
    { type: 'lineTo', point: { x: left.plus(tPocketTabWidth), y: tabBottomY } },
    { type: 'lineTo', point: { x: left, y: tabBottomY } },
    { type: 'lineTo', point: { x: left, y: top } },
    { type: 'close' },
  ]

  return { commands }
}

const calculateDownTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  adjustedOpening: PocketOpeningSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabTopY = bottom.minus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: left, y: bottom } },
    { type: 'lineTo', point: { x: left, y: tabTopY } },
    { type: 'lineTo', point: { x: left.plus(tPocketTabWidth), y: tabTopY } },
    { type: 'lineTo', point: { x: left.plus(tPocketTaper), y: top } },
    { type: 'lineTo', point: { x: right.minus(tPocketTaper), y: top } },
    { type: 'lineTo', point: { x: right.minus(tPocketTabWidth), y: tabTopY } },
    { type: 'lineTo', point: { x: right, y: tabTopY } },
    { type: 'lineTo', point: { x: right, y: bottom } },
    ...calculatePocketOpeningPath(adjustedOpening, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: left, y: bottom } },
    { type: 'close' },
  ]

  return { commands }
}

const calculateLeftTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  adjustedOpening: PocketOpeningSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabRightX = left.plus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: left, y: top } },
    { type: 'lineTo', point: { x: tabRightX, y: top } },
    { type: 'lineTo', point: { x: tabRightX, y: top.plus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: right, y: top.plus(tPocketTaper) } },
    { type: 'lineTo', point: { x: right, y: bottom.minus(tPocketTaper) } },
    { type: 'lineTo', point: { x: tabRightX, y: bottom.minus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: tabRightX, y: bottom } },
    { type: 'lineTo', point: { x: left, y: bottom } },
    ...calculatePocketOpeningPath(adjustedOpening, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: left, y: top } },
    { type: 'close' },
  ]

  return { commands }
}

const calculateRightTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  adjustedOpening: PocketOpeningSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabLeftX = right.minus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: right, y: top } },
    ...calculatePocketOpeningPath(adjustedOpening, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: right, y: bottom } },
    { type: 'lineTo', point: { x: tabLeftX, y: bottom } },
    { type: 'lineTo', point: { x: tabLeftX, y: bottom.minus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: left, y: bottom.minus(tPocketTaper) } },
    { type: 'lineTo', point: { x: left, y: top.plus(tPocketTaper) } },
    { type: 'lineTo', point: { x: tabLeftX, y: top.plus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: tabLeftX, y: top } },
    { type: 'lineTo', point: { x: right, y: top } },
    { type: 'close' },
  ]

  return { commands }
}
