import { useMemo, type FC, type ReactNode } from 'react'
import {
  POCKET_ITEM_STITCH_MASK_CONTENT_ID,
  POCKET_ITEM_STITCH_MASK_ID,
  POCKET_ITEM_STITCH_MASK_REVERSE_ID,
  VIEWBOX_PADDING,
} from '../../constants/drawing'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import {
  SvgFaceContext,
  useSvgFace,
  type SvgFaceContextValue,
  type SvgViewDirection,
} from '../../contexts/SvgFaceContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import { getHorizontalReflectionTransform } from '../../logic/geometryUtils'
import type { RootPanelSchema } from '../../schemas/components'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import type { PathSchema } from '../../schemas/geometry'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { SvgComponentLayers } from './SvgComponentLayers'

type PocketItemStitchMaskProps = {
  componentId: string
  faceIdAboveRoot: string
}

export const PocketItemStitchMask: FC<PocketItemStitchMaskProps> = ({ componentId, faceIdAboveRoot }) => {
  const component = useComponent(componentId)
  const { computedSubProject } = useSubProject()
  const root = accessors.computedSubProject(computedSubProject).component.rootPanel()
  const axisX = root.boundingRect.x.plus(root.boundingRect.width.dividedBy(2))
  const x = computedSubProject.viewBox.x.minus(VIEWBOX_PADDING).toNumber()
  const y = computedSubProject.viewBox.y.minus(VIEWBOX_PADDING).toNumber()
  const width = computedSubProject.viewBox.width.plus(VIEWBOX_PADDING * 2).toNumber()
  const height = computedSubProject.viewBox.height.plus(VIEWBOX_PADDING * 2).toNumber()
  let content: ReactNode
  switch (component.type) {
    case 'root-panel':
      content = <PocketItemStitchMaskRoot componentId={componentId} faceIdAboveRoot={faceIdAboveRoot} />
      break
    case 'root-panel-face':
      content = <PocketItemStitchMaskFace componentId={componentId} direction="forward" />
      break
    case 'panel':
    case 'pocket-cluster':
    case 'front-pocket':
    case 't-pocket':
      content = <PocketItemStitchMaskComponent componentId={componentId} />
      break
  }

  return (
    <>
      <g id={POCKET_ITEM_STITCH_MASK_CONTENT_ID}>{content}</g>
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
        <use href={`#${POCKET_ITEM_STITCH_MASK_CONTENT_ID}`} />
      </mask>
      <mask
        id={POCKET_ITEM_STITCH_MASK_REVERSE_ID}
        maskUnits="userSpaceOnUse"
        maskContentUnits="userSpaceOnUse"
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ maskType: 'luminance' }}
      >
        <rect x={x} y={y} width={width} height={height} fill="white" />
        <use href={`#${POCKET_ITEM_STITCH_MASK_CONTENT_ID}`} transform={getHorizontalReflectionTransform(axisX)} />
      </mask>
    </>
  )
}

type PocketItemStitchMaskComponentProps = {
  componentId: string
}

const PocketItemStitchMaskRoot: FC<PocketItemStitchMaskProps> = ({ componentId, faceIdAboveRoot }) => {
  const { componentStyles } = useDrawAreaContext()
  const component = useComponent<RootPanelSchema>(componentId)
  const { computedSubProject } = useSubProject()
  const face = accessors.computedSubProject(computedSubProject).component.rootPanelFace(faceIdAboveRoot)
  const faceIdBelowRoot = faceIdAboveRoot === component.frontFaceId ? component.backFaceId : component.frontFaceId
  const componentStyleParams: DrawAreaComponentStyleParams = { component, nestingLevel: 0 }

  return (
    <>
      <PocketItemStitchMaskFace componentId={faceIdBelowRoot} direction="reverse" />
      <PocketItemStitchMaskPath
        path={face.path}
        fill={componentStyles.getMaskFillColor(componentStyleParams)}
        stroke={componentStyles.getMaskStrokeColor(componentStyleParams)}
        strokeWidth={componentStyles.getBorderThickness(componentStyleParams)}
      />
      <PocketItemStitchMaskFace componentId={faceIdAboveRoot} direction="forward" />
    </>
  )
}

type PocketItemStitchMaskFaceProps = PocketItemStitchMaskComponentProps & {
  direction: SvgViewDirection
}

const PocketItemStitchMaskFace: FC<PocketItemStitchMaskFaceProps> = ({ componentId, direction }) => {
  const view = useMemo<SvgFaceContextValue>(() => ({ faceId: componentId, direction }), [componentId, direction])
  const { computedSubProject } = useSubProject()
  const root = accessors.computedSubProject(computedSubProject).component.rootPanel()
  const axisX = root.boundingRect.x.plus(root.boundingRect.width.dividedBy(2))
  return (
    <SvgFaceContext.Provider value={view}>
      <g transform={direction === 'reverse' ? getHorizontalReflectionTransform(axisX) : undefined}>
        <PocketItemStitchMaskComponent componentId={componentId} />
      </g>
    </SvgFaceContext.Provider>
  )
}

const PocketItemStitchMaskComponent: FC<PocketItemStitchMaskComponentProps> = ({ componentId }) => {
  const { pocketItemStyles, componentStyles, isInteractive, selection } = useDrawAreaContext()
  const { direction } = useSvgFace()
  const component = useComponent(componentId)
  const computed = useComputedComponent(componentId)
  const { subProject } = useSubProject()
  const componentStyleParams: DrawAreaComponentStyleParams = { component, nestingLevel: 0 }

  if (narrowers.is.computedRootPanel(computed)) {
    throw new Error(`Root panel cannot be rendered inside a face mask: ${componentId}`)
  }

  const componentPath = (
    <PocketItemStitchMaskPath
      path={computed.path}
      fill={componentStyles.getMaskFillColor(componentStyleParams)}
      stroke={componentStyles.getMaskStrokeColor(componentStyleParams)}
      strokeWidth={componentStyles.getBorderThickness(componentStyleParams)}
    />
  )
  const childIds = direction === 'reverse' ? [...computed.children].reverse() : computed.children
  const children = childIds.map((childId) => <PocketItemStitchMaskComponent key={childId} componentId={childId} />)

  switch (computed.type) {
    case 'computed-root-panel-face':
      return <>{children}</>
    case 'computed-panel':
      return <SvgComponentLayers content={componentPath} after={children} />
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
      const itemStyleParams = { owner: accessors.subProject(subProject).component.pocket(componentId) }
      return (
        <SvgComponentLayers
          content={componentPath}
          before={
            isDefined(computed.item) && (
              <PocketItemStitchMaskPath
                path={computed.item.path}
                fill={pocketItemStyles.getMaskFillColor(itemStyleParams)}
                stroke={pocketItemStyles.getMaskStrokeColor(itemStyleParams)}
                strokeWidth={pocketItemStyles.getStrokeThickness(itemStyleParams)}
              />
            )
          }
          after={computed.type === 'computed-front-pocket' && children}
        />
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
