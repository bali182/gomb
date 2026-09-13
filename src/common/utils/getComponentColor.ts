import { converter, formatHex, formatHex8 } from 'culori'

import { clamp } from './clamp'

const COMPONENT_COLOR_LIGHTNESS_STEP = 0.05
const COMPONENT_COLOR_MAX_LIGHTNESS = 0.72

export const getComponentColor = (baseColor: string, nestingLevel: number): string => {
  const color = converter('oklch')(baseColor)

  if (!color) {
    return baseColor
  }

  const maxLightness = Math.max(color.l, COMPONENT_COLOR_MAX_LIGHTNESS)

  const adjustedColor = {
    ...color,
    l: clamp(color.l + nestingLevel * COMPONENT_COLOR_LIGHTNESS_STEP, color.l, maxLightness).toNumber(),
  }

  return (color.alpha ?? 1) === 1 ? formatHex(adjustedColor) : formatHex8(adjustedColor)
}
