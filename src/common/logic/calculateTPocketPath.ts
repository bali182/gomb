import BigNumber from 'bignumber.js'

import { ZERO } from '../constants/layout'
import type { PocketClusterSchema, PocketTopOwnSchema } from '../schemas/components'
import type { CornerRadiusSchema, PathCommand, PathSchema, RectSchema } from '../schemas/geometry'
import { calculatePocketTopPath } from './calculatePocketTopPath'
import { getTPocketTabDepth } from './pocketUtils'

export const calculateTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  cornerRadius: CornerRadiusSchema,
  adjustedPocketTop: PocketTopOwnSchema,
): PathSchema => {
  switch (pocketCluster.orientation) {
    case 'up':
      return calculateUpTPocketPath(rect, pocketCluster, cornerRadius, adjustedPocketTop)
    case 'down':
      return calculateDownTPocketPath(rect, pocketCluster, cornerRadius, adjustedPocketTop)
    case 'left':
      return calculateLeftTPocketPath(rect, pocketCluster, cornerRadius, adjustedPocketTop)
    case 'right':
      return calculateRightTPocketPath(rect, pocketCluster, cornerRadius, adjustedPocketTop)
  }
}

const calculateUpTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  cornerRadius: CornerRadiusSchema,
  adjustedPocketTop: PocketTopOwnSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const topLeftRadius = new BigNumber(cornerRadius.topLeft)
  const topRightRadius = new BigNumber(cornerRadius.topRight)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabBottomY = top.plus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: left.plus(topLeftRadius), y: top } },
    ...calculatePocketTopPath(adjustedPocketTop, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: right.minus(topRightRadius), y: top } },
  ]

  if (topRightRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: topRightRadius,
      point: { x: right, y: top.plus(topRightRadius) },
      reversed: false,
    })
  }

  commands.push(
    { type: 'lineTo', point: { x: right, y: tabBottomY } },
    { type: 'lineTo', point: { x: right.minus(tPocketTabWidth), y: tabBottomY } },
    { type: 'lineTo', point: { x: right.minus(tPocketTaper), y: bottom } },
    { type: 'lineTo', point: { x: left.plus(tPocketTaper), y: bottom } },
    { type: 'lineTo', point: { x: left.plus(tPocketTabWidth), y: tabBottomY } },
    { type: 'lineTo', point: { x: left, y: tabBottomY } },
    { type: 'lineTo', point: { x: left, y: top.plus(topLeftRadius) } },
  )

  if (topLeftRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: topLeftRadius,
      point: { x: left.plus(topLeftRadius), y: top },
      reversed: false,
    })
  }

  commands.push({ type: 'close' })

  return { commands }
}

const calculateDownTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  cornerRadius: CornerRadiusSchema,
  adjustedPocketTop: PocketTopOwnSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const bottomLeftRadius = new BigNumber(cornerRadius.bottomLeft)
  const bottomRightRadius = new BigNumber(cornerRadius.bottomRight)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabTopY = bottom.minus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: left, y: bottom.minus(bottomLeftRadius) } },
    { type: 'lineTo', point: { x: left, y: tabTopY } },
    { type: 'lineTo', point: { x: left.plus(tPocketTabWidth), y: tabTopY } },
    { type: 'lineTo', point: { x: left.plus(tPocketTaper), y: top } },
    { type: 'lineTo', point: { x: right.minus(tPocketTaper), y: top } },
    { type: 'lineTo', point: { x: right.minus(tPocketTabWidth), y: tabTopY } },
    { type: 'lineTo', point: { x: right, y: tabTopY } },
    { type: 'lineTo', point: { x: right, y: bottom.minus(bottomRightRadius) } },
  ]

  if (bottomRightRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: bottomRightRadius,
      point: { x: right.minus(bottomRightRadius), y: bottom },
      reversed: false,
    })
  }

  commands.push(
    ...calculatePocketTopPath(adjustedPocketTop, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: left.plus(bottomLeftRadius), y: bottom } },
  )

  if (bottomLeftRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: bottomLeftRadius,
      point: { x: left, y: bottom.minus(bottomLeftRadius) },
      reversed: false,
    })
  }

  commands.push({ type: 'close' })

  return { commands }
}

const calculateLeftTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  cornerRadius: CornerRadiusSchema,
  adjustedPocketTop: PocketTopOwnSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const topLeftRadius = new BigNumber(cornerRadius.topLeft)
  const bottomLeftRadius = new BigNumber(cornerRadius.bottomLeft)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabRightX = left.plus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: left.plus(topLeftRadius), y: top } },
    { type: 'lineTo', point: { x: tabRightX, y: top } },
    { type: 'lineTo', point: { x: tabRightX, y: top.plus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: right, y: top.plus(tPocketTaper) } },
    { type: 'lineTo', point: { x: right, y: bottom.minus(tPocketTaper) } },
    { type: 'lineTo', point: { x: tabRightX, y: bottom.minus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: tabRightX, y: bottom } },
    { type: 'lineTo', point: { x: left.plus(bottomLeftRadius), y: bottom } },
  ]

  if (bottomLeftRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: bottomLeftRadius,
      point: { x: left, y: bottom.minus(bottomLeftRadius) },
      reversed: false,
    })
  }

  commands.push(
    ...calculatePocketTopPath(adjustedPocketTop, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: left, y: top.plus(topLeftRadius) } },
  )

  if (topLeftRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: topLeftRadius,
      point: { x: left.plus(topLeftRadius), y: top },
      reversed: false,
    })
  }

  commands.push({ type: 'close' })

  return { commands }
}

const calculateRightTPocketPath = (
  rect: RectSchema,
  pocketCluster: PocketClusterSchema,
  cornerRadius: CornerRadiusSchema,
  adjustedPocketTop: PocketTopOwnSchema,
): PathSchema => {
  const left = rect.x
  const top = rect.y
  const right = left.plus(rect.width)
  const bottom = top.plus(rect.height)
  const topRightRadius = new BigNumber(cornerRadius.topRight)
  const bottomRightRadius = new BigNumber(cornerRadius.bottomRight)
  const tPocketTabDepth = getTPocketTabDepth(pocketCluster, rect)
  const tPocketTabWidth = new BigNumber(pocketCluster.tPocketTabWidth)
  const tPocketTaper = new BigNumber(pocketCluster.tPocketTaper)
  const tabLeftX = right.minus(tPocketTabDepth)
  const commands: PathCommand[] = [
    { type: 'moveTo', point: { x: right, y: top.plus(topRightRadius) } },
    ...calculatePocketTopPath(adjustedPocketTop, rect, pocketCluster.orientation).commands.filter(
      (command, index, commands) => index > 0 && (index < commands.length - 1 || command.type !== 'lineTo'),
    ),
    { type: 'lineTo', point: { x: right, y: bottom.minus(bottomRightRadius) } },
  ]

  if (bottomRightRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: bottomRightRadius,
      point: { x: right.minus(bottomRightRadius), y: bottom },
      reversed: false,
    })
  }

  commands.push(
    { type: 'lineTo', point: { x: tabLeftX, y: bottom } },
    { type: 'lineTo', point: { x: tabLeftX, y: bottom.minus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: left, y: bottom.minus(tPocketTaper) } },
    { type: 'lineTo', point: { x: left, y: top.plus(tPocketTaper) } },
    { type: 'lineTo', point: { x: tabLeftX, y: top.plus(tPocketTabWidth) } },
    { type: 'lineTo', point: { x: tabLeftX, y: top } },
    { type: 'lineTo', point: { x: right.minus(topRightRadius), y: top } },
  )

  if (topRightRadius.isGreaterThan(ZERO)) {
    commands.push({
      type: 'arcTo',
      radius: topRightRadius,
      point: { x: right, y: top.plus(topRightRadius) },
      reversed: false,
    })
  }

  commands.push({ type: 'close' })

  return { commands }
}
