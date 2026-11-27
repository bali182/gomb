import { useCallback, useMemo, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { PocketSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Guide } from './Guide'
import { HoleHighlights } from './HoleHighlights'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { PocketItem } from './PocketItem'
import { SelectionShadow, type SelectionShadowPath } from './SelectionShadow'
import { SizeLabel } from './SizeLabel'
import { StitchLines } from './StitchLines'
import { SvgComponentLayers } from './SvgComponentLayers'

type PocketProps = {
  componentId: string
  nestingLevel: number
}

export const Pocket: FC<PocketProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, isShowingPocketItems, selection } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const { accessor, computedAccessor } = useSubProject()
  const computed = computedAccessor.component.pocket(componentId)
  const { direction } = useSvgFace()
  const children = narrowers.is.computedFrontPocket(computed) ? computedAccessor.component.children(componentId) : []
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const path = usePath(computed.path)

  const pocket = useMemo(() => accessor.component.pocket(componentId), [accessor.component, componentId])

  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = {
    component: pocket,
    nestingLevel,
  }
  const style: DrawAreaComponentStyleParams = { component: pocket }

  const enter = useCallback<PointerEventHandler<SVGPathElement>>(() => selection.hover(pocket), [pocket, selection])

  const leave = useCallback<PointerEventHandler<SVGPathElement>>(() => selection.clearHover(), [selection])

  const click = useCallback<MouseEventHandler<SVGPathElement>>(
    (event) => {
      event.stopPropagation()
      selection.select(pocket)
    },
    [pocket, selection],
  )
  const active = selection.isSelected(pocket) || selection.isHovered(pocket)

  return (
    <>
      <SvgComponentLayers
        before={
          isShowingPocketItems && isDefined(computed.item) && <PocketItem owner={pocket} path={computed.item.path} />
        }
        content={
          <SvgComponentLayers
            before={<StitchLines componentId={componentId} surface="back" />}
            after={<StitchLines componentId={componentId} surface="front" />}
            content={
              <>
                {active && <PocketSelectionShadow model={pocket} computedModel={computed} path={path} />}
                <path
                  d={path}
                  data-component-id={componentId}
                  fill={componentStyles.getBackgroundColor(backgroundStyleParams)}
                  stroke={componentStyles.getBorderColor(style)}
                  strokeWidth={componentStyles.getBorderThickness(style)}
                  onPointerEnter={isInteractive ? enter : undefined}
                  onPointerLeave={isInteractive ? leave : undefined}
                  onClick={isInteractive ? click : undefined}
                />
                <HoleHighlights componentId={componentId} />
              </>
            }
          />
        }
        after={orderedChildren.map((child) => {
          switch (child.type) {
            case 'computed-guide':
              return <Guide key={child.componentId} componentId={child.componentId} nestingLevel={nestingLevel + 1} />
            case 'computed-panel':
              return <Panel key={child.componentId} componentId={child.componentId} nestingLevel={nestingLevel + 1} />
            case 'computed-pocket-cluster':
              return (
                <PocketCluster
                  key={child.componentId}
                  componentId={child.componentId}
                  nestingLevel={nestingLevel + 1}
                />
              )
            default:
              return undefined
          }
        })}
      />
      {settings.view.componentDimensionsVisible && active && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
    </>
  )
}

type PocketSelectionShadowProps = {
  model: PocketSchema
  computedModel: ComputedPocketSchema
  path: string
}

const PocketSelectionShadow: FC<PocketSelectionShadowProps> = ({ model, computedModel, path }) => {
  const { componentStyles, selectionStyles } = useDrawAreaContext()
  const paths = useMemo<SelectionShadowPath[]>(
    () => [{ path, strokeWidth: componentStyles.getBorderThickness({ component: model }) ?? 1 }],
    [path, componentStyles, model],
  )

  return (
    <SelectionShadow
      paths={paths}
      boundingRect={computedModel.boundingRect}
      color={selectionStyles.getSelectionColor()}
    />
  )
}
