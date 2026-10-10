import { Fragment, type FC } from 'react'

import { VIEWBOX_PADDING } from '../../constants/drawing'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { DrawAreaCardStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import type { PathSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'

type PocketStitchMaskProps = {
  id: string
  componentId: string
  nestingLevel: number
}

export const PocketStitchMask: FC<PocketStitchMaskProps> = ({ id, componentId, nestingLevel }) => {
  const { cardStyles, componentStyles } = useDrawAreaContext()
  const pocketCluster = useComponent<PocketClusterSchema>(componentId)
  const computedPocketCluster = useComputedComponent<ComputedPocketClusterSchema>(componentId)
  const { computedSubProject } = useSubProject()
  const x = computedSubProject.viewBox.x.minus(VIEWBOX_PADDING).toNumber()
  const y = computedSubProject.viewBox.y.minus(VIEWBOX_PADDING).toNumber()
  const width = computedSubProject.viewBox.width.plus(VIEWBOX_PADDING * 2).toNumber()
  const height = computedSubProject.viewBox.height.plus(VIEWBOX_PADDING * 2).toNumber()
  const cardStyleParams: DrawAreaCardStyleParams = { owner: pocketCluster }
  const componentStyleParams: DrawAreaComponentStyleParams = { component: pocketCluster, nestingLevel }
  const cardFill = cardStyles.getMaskFillColor(cardStyleParams)
  const cardStroke = cardStyles.getMaskStrokeColor(cardStyleParams)
  const cardStrokeWidth = cardStyles.getStrokeThickness(cardStyleParams)
  const pocketFill = componentStyles.getMaskFillColor(componentStyleParams)
  const pocketStroke = componentStyles.getMaskStrokeColor(componentStyleParams)
  const pocketStrokeWidth = componentStyles.getBorderThickness(componentStyleParams)
  const pockets = [...computedPocketCluster.tPockets, computedPocketCluster.frontPocket]

  return (
    <mask
      id={id}
      maskUnits="userSpaceOnUse"
      maskContentUnits="userSpaceOnUse"
      x={x}
      y={y}
      width={width}
      height={height}
      style={{ maskType: 'luminance' }}
    >
      <rect x={x} y={y} width={width} height={height} fill="white" />
      {pockets.map((pocket) => (
        <Fragment key={pocket.id}>
          {isDefined(pocket.card) && (
            <PocketStitchMaskPath
              path={pocket.card.path}
              fill={cardFill}
              stroke={cardStroke}
              strokeWidth={cardStrokeWidth}
            />
          )}
          <PocketStitchMaskPath
            path={pocket.path}
            fill={pocketFill}
            stroke={pocketStroke}
            strokeWidth={pocketStrokeWidth}
          />
        </Fragment>
      ))}
    </mask>
  )
}

type PocketStitchMaskPathProps = {
  path: PathSchema
  fill: string | undefined
  stroke: string | undefined
  strokeWidth: number | undefined
}

const PocketStitchMaskPath: FC<PocketStitchMaskPathProps> = ({ path, fill, stroke, strokeWidth }) => {
  const pathData = usePath(path)

  return <path d={pathData} fill={fill ?? 'none'} stroke={stroke ?? 'none'} strokeWidth={strokeWidth} />
}
