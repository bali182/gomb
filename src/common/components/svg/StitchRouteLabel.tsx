import { type CSSProperties, type FC, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PiNeedle } from 'react-icons/pi'

import {
  STITCH_ROUTE_LABEL_HORIZONTAL_PADDING,
  STITCH_ROUTE_LABEL_ICON_GAP,
  STITCH_ROUTE_LABEL_VERTICAL_PADDING,
} from '../../constants/drawing'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import type { NumberRectSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'
import { positionInside } from './stitchRouteLabelPositioners'

type StitchRouteLabelProps = {
  route: ComputedStitchRouteSchema
}

export const StitchRouteLabel: FC<StitchRouteLabelProps> = ({ route }) => {
  const { stitchRouteLabelStyles } = useDrawAreaContext()
  const textRef = useRef<SVGTextElement>(null)
  const [textBounds, setTextBounds] = useState<NumberRectSchema | undefined>(undefined)
  const backgroundColor = stitchRouteLabelStyles.getLabelBackgroundColor()
  const color = stitchRouteLabelStyles.getLabelColor()
  const fontFamily = stitchRouteLabelStyles.getLabelFontFamily()
  const fontSize = stitchRouteLabelStyles.getLabelFontSize()
  const position = positionInside(route)
  const textStyle: CSSProperties = { color, fontFamily, fontSize }

  useLayoutEffect(() => {
    const textElement = textRef.current
    if (!isDefined(textElement)) {
      return
    }
    const { x, y, width, height } = textElement.getBBox()
    setTextBounds({ x, y, width, height })
  }, [
    fontFamily,
    fontSize,
    position.alignmentBaseline,
    position.textAnchor,
    position.x,
    position.y,
    route.holes.length,
  ])

  const backgroundBounds = useMemo<NumberRectSchema | undefined>(() => {
    if (!isDefined(textBounds)) {
      return undefined
    }
    return {
      x: textBounds.x - textBounds.height - STITCH_ROUTE_LABEL_ICON_GAP - STITCH_ROUTE_LABEL_HORIZONTAL_PADDING,
      y: textBounds.y - STITCH_ROUTE_LABEL_VERTICAL_PADDING,
      width:
        textBounds.width + textBounds.height + STITCH_ROUTE_LABEL_ICON_GAP + STITCH_ROUTE_LABEL_HORIZONTAL_PADDING * 2,
      height: textBounds.height + STITCH_ROUTE_LABEL_VERTICAL_PADDING * 2,
    }
  }, [textBounds])

  const backgroundCornerRadius = useMemo<number | undefined>(() => {
    if (!isDefined(backgroundBounds)) {
      return undefined
    }
    return Math.min(backgroundBounds.width, backgroundBounds.height) / 2
  }, [backgroundBounds])

  return (
    <g pointerEvents="none">
      {isDefined(backgroundBounds) && (
        <rect
          fill={backgroundColor}
          height={backgroundBounds.height}
          rx={backgroundCornerRadius}
          width={backgroundBounds.width}
          x={backgroundBounds.x}
          y={backgroundBounds.y}
        />
      )}
      {isDefined(textBounds) && (
        <PiNeedle
          color={color}
          size={textBounds.height}
          x={textBounds.x - textBounds.height - STITCH_ROUTE_LABEL_ICON_GAP}
          y={textBounds.y}
        />
      )}
      <text
        ref={textRef}
        alignmentBaseline={position.alignmentBaseline}
        fill={color}
        fontFamily={fontFamily}
        fontSize={fontSize}
        textAnchor={position.textAnchor}
        x={position.x}
        y={position.y}
        style={textStyle}
      >
        {route.holes.length}
      </text>
    </g>
  )
}
