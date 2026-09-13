import BigNumber from 'bignumber.js'
import { type CSSProperties, type FC, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PiNeedle } from 'react-icons/pi'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import type { PointSchema, RectSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'
import { getBackgroundBounds, getIconPosition, getLabelPosition } from './stitchRouteLabelPositioners'

type StitchRouteLabelProps = {
  route: ComputedStitchRouteSchema
}

export const StitchRouteLabel: FC<StitchRouteLabelProps> = ({ route }) => {
  const { stitchRouteLabelStyles } = useDrawAreaContext()
  const textRef = useRef<SVGTextElement>(null)
  const [textBounds, setTextBounds] = useState<RectSchema | undefined>(undefined)
  const backgroundColor = stitchRouteLabelStyles.getLabelBackgroundColor()
  const color = stitchRouteLabelStyles.getLabelColor()
  const fontFamily = stitchRouteLabelStyles.getLabelFontFamily()
  const fontSize = stitchRouteLabelStyles.getLabelFontSize()
  const textStyle: CSSProperties = { color, fontFamily, fontSize }

  useLayoutEffect(() => {
    const textElement = textRef.current
    if (!isDefined(textElement)) {
      return
    }
    const { x, y, width, height } = textElement.getBBox()
    setTextBounds({
      x: new BigNumber(x),
      y: new BigNumber(y),
      width: new BigNumber(width),
      height: new BigNumber(height),
    })
  }, [fontFamily, fontSize, route.holes.length])

  const backgroundBounds = useMemo<RectSchema | undefined>(() => {
    if (!isDefined(textBounds)) {
      return undefined
    }
    return getBackgroundBounds(textBounds)
  }, [textBounds])

  const labelPosition = useMemo<PointSchema | undefined>(() => {
    if (!isDefined(backgroundBounds)) {
      return undefined
    }
    return getLabelPosition(route, backgroundBounds)
  }, [backgroundBounds, route])

  const iconPosition = useMemo<PointSchema | undefined>(() => {
    if (!isDefined(textBounds)) {
      return undefined
    }
    return getIconPosition(textBounds)
  }, [textBounds])

  const backgroundCornerRadius = useMemo<BigNumber | undefined>(() => {
    if (!isDefined(backgroundBounds)) {
      return undefined
    }
    return BigNumber.minimum(backgroundBounds.width, backgroundBounds.height).dividedBy(2)
  }, [backgroundBounds])

  return (
    <g
      opacity={isDefined(labelPosition) ? 1 : 0}
      pointerEvents="none"
      transform={
        isDefined(labelPosition) ? `translate(${labelPosition.x.toNumber()} ${labelPosition.y.toNumber()})` : undefined
      }
    >
      {isDefined(backgroundBounds) && isDefined(backgroundCornerRadius) && (
        <rect
          fill={backgroundColor}
          height={backgroundBounds.height.toNumber()}
          rx={backgroundCornerRadius.toNumber()}
          width={backgroundBounds.width.toNumber()}
          x={backgroundBounds.x.toNumber()}
          y={backgroundBounds.y.toNumber()}
        />
      )}
      {isDefined(textBounds) && isDefined(iconPosition) && (
        <PiNeedle
          color={color}
          size={textBounds.height.toNumber()}
          x={iconPosition.x.toNumber()}
          y={iconPosition.y.toNumber()}
        />
      )}
      <text
        ref={textRef}
        alignmentBaseline="middle"
        fill={color}
        fontFamily={fontFamily}
        fontSize={fontSize}
        textAnchor="start"
        x={0}
        y={0}
        style={textStyle}
      >
        {route.holes.length}
      </text>
    </g>
  )
}
