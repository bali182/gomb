import { useId, type FC, type SVGAttributes } from 'react'

import type { RectSchema } from '../../schemas/geometry'

const SELECTION_SHADOW_BLUR = 1
const SELECTION_SHADOW_OPACITY_MULTIPLIER = 2

export type SelectionShadowPath = {
  path: string
  strokeWidth: number
  strokeDasharray?: SVGAttributes<SVGPathElement>['strokeDasharray']
  strokeLinecap?: SVGAttributes<SVGPathElement>['strokeLinecap']
  strokeLinejoin?: SVGAttributes<SVGPathElement>['strokeLinejoin']
}

type SelectionShadowProps = {
  color: string
  paths: readonly SelectionShadowPath[]
  boundingRect: RectSchema
}

export const SelectionShadow: FC<SelectionShadowProps> = ({ color, paths, boundingRect }) => {
  const filterId = useId()
  const maxStrokeWidth = Math.max(0, ...paths.map((shadowPath) => shadowPath.strokeWidth))
  // Include the default miter limit as well as the blur's three-sigma extent.
  const padding = maxStrokeWidth * 2 + SELECTION_SHADOW_BLUR * 3

  return (
    <>
      <filter
        id={filterId}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        x={boundingRect.x.minus(padding).toNumber()}
        y={boundingRect.y.minus(padding).toNumber()}
        width={boundingRect.width.plus(padding * 2).toNumber()}
        height={boundingRect.height.plus(padding * 2).toNumber()}
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur in="SourceAlpha" stdDeviation={SELECTION_SHADOW_BLUR} result="blur" />
        <feComponentTransfer in="blur" result="shadowAlpha">
          <feFuncA type="linear" slope={SELECTION_SHADOW_OPACITY_MULTIPLIER} />
        </feComponentTransfer>
        <feFlood floodColor={color} result="color" />
        <feComposite in="color" in2="shadowAlpha" operator="in" />
      </filter>
      <g filter={`url(#${filterId})`} fill="none" stroke="white" pointerEvents="none">
        {paths.map((shadowPath, index) => (
          <path
            key={index}
            d={shadowPath.path}
            strokeWidth={shadowPath.strokeWidth}
            strokeDasharray={shadowPath.strokeDasharray}
            strokeLinecap={shadowPath.strokeLinecap}
            strokeLinejoin={shadowPath.strokeLinejoin}
          />
        ))}
      </g>
    </>
  )
}
