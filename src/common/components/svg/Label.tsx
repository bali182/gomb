import BigNumber from 'bignumber.js'
import { type CSSProperties, type FC, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { IconType } from 'react-icons'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import type { PointSchema, RectSchema, SizeSchema } from '../../schemas/geometry'
import type { StitchCornerSchema, StitchSideSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { svgLabelsPortalRef } from './svgLabelsPortalRef'

type LabelCommonProps = {
  icon: IconType
  label: string
  portal?: boolean
  // Space from the sides of it's bounding rect
  marginX?: number
  marginY?: number
  // Padding inside the container pill
  paddingX?: number
  paddingY?: number
  // Gap between icon and label
  gap?: number
}

type LabelRectPositionProps = {
  reference: StitchSideSchema | StitchCornerSchema
  boundingRect: RectSchema
  getPosition?: never
}

type LabelPointPositionProps = {
  getPosition: (size: SizeSchema) => PointSchema
  reference?: never
  boundingRect?: never
}

type LabelProps = LabelCommonProps & (LabelRectPositionProps | LabelPointPositionProps)

const DEFAULT_MARGIN_X = 3
const DEFAULT_MARGIN_Y = 3
const DEFAULT_PADDING_X = 1.5
const DEFAULT_PADDING_Y = 0.3
const DEFAULT_GAP = 0.6

export const Label: FC<LabelProps> = ({
  icon: Icon,
  label,
  reference,
  boundingRect,
  getPosition,
  portal = true,
  marginX = DEFAULT_MARGIN_X,
  marginY = DEFAULT_MARGIN_Y,
  paddingX = DEFAULT_PADDING_X,
  paddingY = DEFAULT_PADDING_Y,
  gap = DEFAULT_GAP,
}) => {
  const { labelStyles } = useDrawAreaContext()
  const textRef = useRef<SVGTextElement>(null)
  const [textBounds, setTextBounds] = useState<RectSchema | undefined>(undefined)
  const backgroundColor = labelStyles.getLabelBackgroundColor()
  const color = labelStyles.getLabelColor()
  const fontFamily = labelStyles.getLabelFontFamily()
  const fontSize = labelStyles.getLabelFontSize()
  const textStyle: CSSProperties = { color, fontFamily, fontSize, fontVariantNumeric: 'tabular-nums' }

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
  }, [fontFamily, fontSize, label, portal])

  const backgroundBounds = useMemo<RectSchema | undefined>(() => {
    if (!isDefined(textBounds)) {
      return undefined
    }
    return getBackgroundBounds(textBounds, paddingX, paddingY, gap)
  }, [textBounds, paddingX, paddingY, gap])

  const position = useMemo<PointSchema | undefined>(() => {
    if (!isDefined(backgroundBounds)) {
      return undefined
    }
    if (isDefined(getPosition)) {
      const center = getPosition({ width: backgroundBounds.width, height: backgroundBounds.height })
      return {
        x: center.x.minus(backgroundBounds.x.plus(backgroundBounds.width.dividedBy(2))),
        y: center.y.minus(backgroundBounds.y.plus(backgroundBounds.height.dividedBy(2))),
      }
    }
    if (isDefined(boundingRect) && isDefined(reference)) {
      return getLabelPosition(boundingRect, backgroundBounds, reference, marginX, marginY)
    }
    return undefined
  }, [backgroundBounds, boundingRect, reference, marginX, marginY, getPosition])

  const iconPosition = useMemo<PointSchema | undefined>(() => {
    if (!isDefined(textBounds)) {
      return undefined
    }
    return getIconPosition(textBounds, gap)
  }, [textBounds, gap])

  const backgroundCornerRadius = useMemo<BigNumber | undefined>(() => {
    if (!isDefined(backgroundBounds)) {
      return undefined
    }
    return BigNumber.minimum(backgroundBounds.width, backgroundBounds.height).dividedBy(2)
  }, [backgroundBounds])

  const content = (
    <g
      opacity={isDefined(position) ? 1 : 0}
      pointerEvents="none"
      transform={isDefined(position) ? `translate(${position.x.toNumber()} ${position.y.toNumber()})` : undefined}
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
        <Icon
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
        {label}
      </text>
    </g>
  )

  if (!portal) {
    return content
  }
  if (!isDefined(svgLabelsPortalRef.current)) {
    return null
  }
  return createPortal(content, svgLabelsPortalRef.current)
}

const getBackgroundBounds = (textBounds: RectSchema, paddingX: number, paddingY: number, gap: number): RectSchema => {
  const iconSize = textBounds.height

  return {
    x: textBounds.x.minus(iconSize).minus(gap).minus(paddingX),
    y: textBounds.y.minus(paddingY),
    width: textBounds.width
      .plus(iconSize)
      .plus(gap)
      .plus(paddingX * 2),
    height: textBounds.height.plus(paddingY * 2),
  }
}

const getIconPosition = (textBounds: RectSchema, gap: number): PointSchema => ({
  x: textBounds.x.minus(textBounds.height).minus(gap),
  y: textBounds.y,
})

const getLabelPosition = (
  boundingRect: RectSchema,
  backgroundBounds: RectSchema,
  reference: StitchSideSchema | StitchCornerSchema,
  marginX: number,
  marginY: number,
): PointSchema => {
  const left = boundingRect.x.plus(marginX).minus(backgroundBounds.x)
  const centerX = boundingRect.x
    .plus(boundingRect.width.dividedBy(2))
    .minus(backgroundBounds.x.plus(backgroundBounds.width.dividedBy(2)))
  const right = boundingRect.x
    .plus(boundingRect.width)
    .minus(marginX)
    .minus(backgroundBounds.x)
    .minus(backgroundBounds.width)
  const top = boundingRect.y.plus(marginY).minus(backgroundBounds.y)
  const centerY = boundingRect.y
    .plus(boundingRect.height.dividedBy(2))
    .minus(backgroundBounds.y.plus(backgroundBounds.height.dividedBy(2)))
  const bottom = boundingRect.y
    .plus(boundingRect.height)
    .minus(marginY)
    .minus(backgroundBounds.y)
    .minus(backgroundBounds.height)

  switch (reference) {
    case 'top':
      return { x: centerX, y: top }
    case 'right':
      return { x: right, y: centerY }
    case 'bottom':
      return { x: centerX, y: bottom }
    case 'left':
      return { x: left, y: centerY }
    case 'top-left':
      return { x: left, y: top }
    case 'top-right':
      return { x: right, y: top }
    case 'bottom-right':
      return { x: right, y: bottom }
    case 'bottom-left':
      return { x: left, y: bottom }
  }
}
