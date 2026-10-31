import { Fragment, type FC } from 'react'

import { VIEWBOX_PADDING } from '../../constants/drawing'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { PocketClusterSchema } from '../../schemas/components'
import type { DrawAreaComponentStyleParams, DrawAreaPocketItemStyleParams } from '../../schemas/drawArea'
import type { PathSchema } from '../../schemas/geometry'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

type PocketStitchMaskProps = {
  id: string
  componentId: string
  nestingLevel: number
}

export const PocketStitchMask: FC<PocketStitchMaskProps> = ({ id, componentId, nestingLevel }) => {
  const { pocketItemStyles, componentStyles } = useDrawAreaContext()
  const pocketCluster = useComponent<PocketClusterSchema>(componentId)
  const { subProject, computedSubProject } = useSubProject()
  const source = accessors.subProject(subProject)
  const computedAccessor = accessors.computedSubProject(computedSubProject)
  const x = computedSubProject.viewBox.x.minus(VIEWBOX_PADDING).toNumber()
  const y = computedSubProject.viewBox.y.minus(VIEWBOX_PADDING).toNumber()
  const width = computedSubProject.viewBox.width.plus(VIEWBOX_PADDING * 2).toNumber()
  const height = computedSubProject.viewBox.height.plus(VIEWBOX_PADDING * 2).toNumber()
  const componentStyleParams: DrawAreaComponentStyleParams = { component: pocketCluster, nestingLevel }
  const pocketFill = componentStyles.getMaskFillColor(componentStyleParams)
  const pocketStroke = componentStyles.getMaskStrokeColor(componentStyleParams)
  const pocketStrokeWidth = componentStyles.getBorderThickness(componentStyleParams)
  const pockets = computedAccessor.component
    .children(componentId)
    .filter((pocket) => narrowers.is.computedFrontPocket(pocket) || narrowers.is.computedTPocket(pocket))

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
      {pockets.map((pocket) => {
        const cardStyleParams: DrawAreaPocketItemStyleParams = {
          owner: source.component.pocket(pocket.componentId),
        }
        return (
          <Fragment key={pocket.componentId}>
            {isDefined(pocket.item) && (
              <PocketStitchMaskPath
                path={pocket.item.path}
                fill={pocketItemStyles.getMaskFillColor(cardStyleParams)}
                stroke={pocketItemStyles.getMaskStrokeColor(cardStyleParams)}
                strokeWidth={pocketItemStyles.getStrokeThickness(cardStyleParams)}
              />
            )}
            <PocketStitchMaskPath
              path={pocket.path}
              fill={pocketFill}
              stroke={pocketStroke}
              strokeWidth={pocketStrokeWidth}
            />
          </Fragment>
        )
      })}
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
