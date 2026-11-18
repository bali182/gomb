import type { FC } from 'react'
import { narrowers } from '../../utils/narrowers'

import { POCKET_ITEM_STITCH_MASK_ID, VIEWBOX_PADDING } from '../../constants/drawing'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { DrawAreaComponentStyleParams, DrawAreaPocketItemStyleParams } from '../../schemas/drawArea'
import type { PathSchema } from '../../schemas/geometry'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'

type PocketItemStitchMaskProps = {
  componentId: string
}

export const PocketItemStitchMask: FC<PocketItemStitchMaskProps> = ({ componentId }) => {
  const { computedSubProject } = useSubProject()
  const x = computedSubProject.viewBox.x.minus(VIEWBOX_PADDING).toNumber()
  const y = computedSubProject.viewBox.y.minus(VIEWBOX_PADDING).toNumber()
  const width = computedSubProject.viewBox.width.plus(VIEWBOX_PADDING * 2).toNumber()
  const height = computedSubProject.viewBox.height.plus(VIEWBOX_PADDING * 2).toNumber()

  return (
    <mask
      id={POCKET_ITEM_STITCH_MASK_ID}
      maskUnits="userSpaceOnUse"
      maskContentUnits="userSpaceOnUse"
      x={x}
      y={y}
      width={width}
      height={height}
      style={{ maskType: 'luminance' }}
    >
      <rect x={x} y={y} width={width} height={height} fill="white" />
      <PocketItemStitchMaskComponent componentId={componentId} />
    </mask>
  )
}

const PocketItemStitchMaskComponent: FC<PocketItemStitchMaskProps> = ({ componentId }) => {
  const { pocketItemStyles, componentStyles, isInteractive, selection, rootPanelFaceId } = useDrawAreaContext()
  const component = useComponent(componentId)
  const computed = useComputedComponent(componentId)
  const { subProject, computedSubProject } = useSubProject()
  const componentStyleParams: DrawAreaComponentStyleParams = { component, nestingLevel: 0 }
  const path = narrowers.is.computedRootPanel(computed)
    ? accessors
        .computedSubProject(computedSubProject)
        .component.rootPanelFace(rootPanelFaceId === computed.backFaceId ? computed.backFaceId : computed.frontFaceId)
        .path
    : computed.path
  const componentPath = narrowers.is.computedRootPanelFace(computed) ? null : (
    <PocketItemStitchMaskPath
      path={path}
      fill={componentStyles.getMaskFillColor(componentStyleParams)}
      stroke={componentStyles.getMaskStrokeColor(componentStyleParams)}
      strokeWidth={componentStyles.getBorderThickness(componentStyleParams)}
    />
  )

  const childIds = narrowers.is.computedRootPanel(computed)
    ? [rootPanelFaceId ?? computed.frontFaceId]
    : computed.children
  const children = childIds.map((childId) => <PocketItemStitchMaskComponent key={childId} componentId={childId} />)

  switch (computed.type) {
    case 'computed-root-panel-face':
      return <>{children}</>
    case 'computed-root-panel':
    case 'computed-panel':
      return (
        <>
          {componentPath}
          {children}
        </>
      )
    case 'computed-pocket-cluster': {
      const isEmpty = computed.children.length === 0
      const isActive = selection.isSelected(component) || selection.isHovered(component)
      return (
        <>
          {(isEmpty ? isInteractive : isActive) && componentPath}
          {children}
        </>
      )
    }
    case 'computed-front-pocket':
    case 'computed-t-pocket': {
      const itemStyleParams: DrawAreaPocketItemStyleParams = {
        owner: accessors.subProject(subProject).component.pocket(componentId),
      }
      return (
        <>
          {isDefined(computed.item) && (
            <PocketItemStitchMaskPath
              path={computed.item.path}
              fill={pocketItemStyles.getMaskFillColor(itemStyleParams)}
              stroke={pocketItemStyles.getMaskStrokeColor(itemStyleParams)}
              strokeWidth={pocketItemStyles.getStrokeThickness(itemStyleParams)}
            />
          )}
          {componentPath}
          {computed.type === 'computed-front-pocket' && children}
        </>
      )
    }
  }
}

type PocketItemStitchMaskPathProps = {
  path: PathSchema
  fill: string | undefined
  stroke: string | undefined
  strokeWidth: number | undefined
}

const PocketItemStitchMaskPath: FC<PocketItemStitchMaskPathProps> = ({ path, fill, stroke, strokeWidth }) => {
  const pathData = usePath(path)
  return <path d={pathData} fill={fill ?? 'none'} stroke={stroke ?? 'none'} strokeWidth={strokeWidth} />
}
