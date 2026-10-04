import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState, type FC, type MouseEvent, type PointerEvent } from 'react'
import { PiRuler } from 'react-icons/pi'

import { STROKE_THICKNESS, VIEWBOX_PADDING } from '../../constants/drawing'
import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import { useTranslation } from '../../hooks/useTranslation'
import { getPointDistance } from '../../logic/geometryUtils'
import type { LineSchema, PointSchema, SizeSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'
import { Label } from './Label'

const MEASUREMENT_LABEL_GAP = 2

export const MeasurementOverlay: FC = () => {
  const { project } = useProject()
  const { computedSubProject } = useSubProject()
  const { t } = useTranslation()
  const [start, setStart] = useState<PointSchema | undefined>(undefined)
  const [pointer, setPointer] = useState<PointSchema | undefined>(undefined)
  const [isShiftPressed, setShiftPressed] = useState<boolean>(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Shift') {
        setShiftPressed(true)
      }
    }
    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === 'Shift') {
        setShiftPressed(false)
      }
    }
    const handleBlur = (): void => setShiftPressed(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const handleClick = useCallback((event: MouseEvent<SVGRectElement>): void => {
    const point = getSvgPoint(event)
    if (!isDefined(point)) {
      return
    }
    event.stopPropagation()
    setStart(point)
    setPointer(point)
    setShiftPressed(event.shiftKey)
  }, [])

  const handlePointerMove = useCallback((event: PointerEvent<SVGRectElement>): void => {
    const point = getSvgPoint(event)
    if (!isDefined(point)) {
      return
    }
    setPointer(point)
    setShiftPressed(event.shiftKey)
  }, [])

  const line = useMemo<LineSchema | undefined>(() => {
    if (!isDefined(start) || !isDefined(pointer)) {
      return undefined
    }
    if (!isShiftPressed) {
      return { start, end: pointer }
    }
    const isHorizontal = pointer.x
      .minus(start.x)
      .absoluteValue()
      .isGreaterThanOrEqualTo(pointer.y.minus(start.y).absoluteValue())
    return {
      start,
      end: isHorizontal ? { x: pointer.x, y: start.y } : { x: start.x, y: pointer.y },
    }
  }, [start, pointer, isShiftPressed])

  const length = useMemo<BigNumber | undefined>(
    () => (isDefined(line) ? getPointDistance(line.start, line.end) : undefined),
    [line],
  )

  const getPosition = useCallback(
    (size: SizeSchema): PointSchema => {
      if (!isDefined(line)) {
        throw new Error('Cannot position a measurement label without a line')
      }
      return getMeasurementLabelPosition(line, size)
    },
    [line],
  )

  const { viewBox } = computedSubProject

  return (
    <g>
      <rect
        x={viewBox.x.minus(VIEWBOX_PADDING).toNumber()}
        y={viewBox.y.minus(VIEWBOX_PADDING).toNumber()}
        width={viewBox.width.plus(VIEWBOX_PADDING * 2).toNumber()}
        height={viewBox.height.plus(VIEWBOX_PADDING * 2).toNumber()}
        fill="transparent"
        pointerEvents="all"
        cursor="crosshair"
        onClick={handleClick}
        onPointerMove={handlePointerMove}
      />
      {isDefined(line) && (
        <line
          x1={line.start.x.toNumber()}
          y1={line.start.y.toNumber()}
          x2={line.end.x.toNumber()}
          y2={line.end.y.toNumber()}
          stroke={project.colorSettings.selectionColor}
          strokeWidth={STROKE_THICKNESS}
          pointerEvents="none"
        />
      )}
      {isDefined(length) && length.isGreaterThan(0) && (
        <Label
          icon={PiRuler}
          label={t.formatters.size(t.formatters.number.fixed2(length.toNumber()))}
          getPosition={getPosition}
          portal={false}
        />
      )}
    </g>
  )
}

const getSvgPoint = (event: MouseEvent<SVGRectElement>): PointSchema | undefined => {
  const matrix = event.currentTarget.ownerSVGElement?.getScreenCTM()
  if (!isDefined(matrix)) {
    return undefined
  }
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
  return { x: new BigNumber(point.x), y: new BigNumber(point.y) }
}

const getMeasurementLabelPosition = (line: LineSchema, size: SizeSchema): PointSchema => {
  const length = getPointDistance(line.start, line.end)
  if (length.isZero()) {
    return line.start
  }
  const directionX = line.end.x.minus(line.start.x).dividedBy(length)
  const directionY = line.end.y.minus(line.start.y).dividedBy(length)
  const isHorizontal = size.width.isGreaterThanOrEqualTo(size.height)
  const radius = BigNumber.minimum(size.width, size.height).dividedBy(2)
  const halfSegmentLength = BigNumber.maximum(size.width, size.height).dividedBy(2).minus(radius)
  const expandedRadius = radius.plus(MEASUREMENT_LABEL_GAP)
  const majorDirection = (isHorizontal ? directionX : directionY).absoluteValue()
  const minorDirection = (isHorizontal ? directionY : directionX).absoluteValue()
  const sideDistance = minorDirection.isZero() ? new BigNumber(Infinity) : expandedRadius.dividedBy(minorDirection)

  // Intersect the ray with the label's capsule expanded by the required gap.
  const distance = sideDistance.times(majorDirection).isLessThanOrEqualTo(halfSegmentLength)
    ? sideDistance
    : halfSegmentLength
        .times(majorDirection)
        .plus(expandedRadius.pow(2).minus(halfSegmentLength.times(minorDirection).pow(2)).sqrt())

  return {
    x: line.start.x.minus(directionX.times(distance)),
    y: line.start.y.minus(directionY.times(distance)),
  }
}
