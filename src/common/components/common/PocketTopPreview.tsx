import BigNumber from 'bignumber.js'
import { useMemo, type FC } from 'react'

import { ZERO } from '../../constants/layout'
import { usePath } from '../../hooks/usePath'
import { calculatePocketTopPath } from '../../logic/calculatePocketTopPath'
import type { PocketOrientationSchema, PocketOpeningOwnSchema } from '../../schemas/components'
import type { PathSchema, RectSchema } from '../../schemas/geometry'
import { getViewBox } from '../../utils/getViewBox'

type PocketTopPreviewProps = {
  adjustedPocketTop: PocketOpeningOwnSchema
  pocketRect: RectSchema
  orientation: PocketOrientationSchema
  width: number
  height: number
}

export const PocketTopPreview: FC<PocketTopPreviewProps> = ({
  adjustedPocketTop,
  pocketRect,
  orientation,
  width,
  height,
}) => {
  const normalizedRect = useMemo<RectSchema>(() => {
    const isVertical = orientation === 'up' || orientation === 'down'
    return {
      x: ZERO,
      y: ZERO,
      width: isVertical ? pocketRect.width : pocketRect.height,
      height: isVertical ? pocketRect.height : pocketRect.width,
    }
  }, [orientation, pocketRect])

  const path = useMemo<PathSchema>(
    () => calculatePocketTopPath(adjustedPocketTop, normalizedRect, 'up'),
    [adjustedPocketTop, normalizedRect],
  )

  const pathData = usePath(path)

  const depth = useMemo<BigNumber>(() => {
    switch (adjustedPocketTop.type) {
      case 'straight':
        return ZERO
      case 'recessed':
        if (
          adjustedPocketTop.depth > 0 &&
          normalizedRect.width.dividedBy(2).isGreaterThan(adjustedPocketTop.outerInset)
        ) {
          return new BigNumber(adjustedPocketTop.depth)
        }
        return ZERO
    }
  }, [adjustedPocketTop, normalizedRect.width])

  const viewBox = useMemo<string>(() => {
    const bounds: RectSchema = { x: ZERO, y: ZERO, width: normalizedRect.width, height: depth }
    const padding = Math.max(bounds.width.toNumber(), depth.toNumber(), 1) * 0.06
    return getViewBox(bounds, padding)
  }, [depth, normalizedRect.width])

  return (
    <svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ flexShrink: 0 }}>
      <path d={pathData} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
