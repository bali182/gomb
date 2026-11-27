import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { RootPanelSchema } from '../../schemas/components'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { PureSvgComponent } from './PureSvgComponent'
import { RootPanelFace } from './RootPanelFace'
import { SelectionPortal } from './SelectionPortal'
import { SizeLabel } from './SizeLabel'

type RootPanelProps = {
  componentId: string
  nestingLevel: number
  faceIdAboveRoot: string
}
export const RootPanel: FC<RootPanelProps> = ({ componentId, nestingLevel, faceIdAboveRoot }) => {
  const { componentStyles, selectionStyles, isInteractive, selection } = useDrawAreaContext()
  const { hover, clearHover, select } = selection
  const { settings } = useGlobalSettings()
  const { accessor, computedAccessor } = useSubProject()
  const visibleFace = accessor.component.rootPanelFace(faceIdAboveRoot)

  const rootPanel = useMemo<RootPanelSchema>(
    () => accessor.component.rootPanel(componentId),
    [accessor.component, componentId],
  )

  const inactiveFaceId = faceIdAboveRoot === rootPanel.frontFaceId ? rootPanel.backFaceId : rootPanel.frontFaceId
  const computedFace = computedAccessor.component.rootPanelFace(faceIdAboveRoot)
  const path = usePath(computedFace.path)
  const isRootActive = selection.isSelected(rootPanel) || selection.isHovered(rootPanel)
  const isActive = isRootActive || selection.isSelected(visibleFace) || selection.isHovered(visibleFace)
  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = {
    component: rootPanel,
    nestingLevel,
    faceIdAboveRoot,
  }
  const outlineStyleParams: DrawAreaComponentStyleParams = {
    component: isRootActive ? rootPanel : visibleFace,
  }

  const handlePointerEnter = useCallback((): void => {
    hover(visibleFace)
  }, [visibleFace, hover])

  const handlePointerLeave = useCallback((): void => {
    clearHover()
  }, [clearHover])

  const handleClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      select(visibleFace)
    },
    [visibleFace, select],
  )

  return (
    <>
      <RootPanelFace
        key={inactiveFaceId}
        componentId={inactiveFaceId}
        nestingLevel={nestingLevel}
        direction="reverse"
      />
      <PureSvgComponent
        mode={isActive ? 'hit-area' : 'normal'}
        componentId={rootPanel.id}
        path={path}
        boundingRect={computedFace.boundingRect}
        fillColor={componentStyles.getBackgroundColor(backgroundStyleParams)}
        strokeColor={componentStyles.getBorderColor(outlineStyleParams)}
        strokeWidth={componentStyles.getBorderThickness(outlineStyleParams)}
        selectionColor={selectionStyles.getSelectionColor()}
        disablePointerEvents={!isInteractive}
        onPointerEnter={isInteractive ? handlePointerEnter : undefined}
        onPointerLeave={isInteractive ? handlePointerLeave : undefined}
        onClick={isInteractive ? handleClick : undefined}
      />
      {isActive && (
        <SelectionPortal>
          <PureSvgComponent
            mode="selected"
            componentId={rootPanel.id}
            path={path}
            boundingRect={computedFace.boundingRect}
            fillColor={componentStyles.getBackgroundColor(backgroundStyleParams)}
            strokeColor={componentStyles.getBorderColor(outlineStyleParams)}
            strokeWidth={componentStyles.getBorderThickness(outlineStyleParams)}
            selectionColor={selectionStyles.getSelectionColor()}
          />
        </SelectionPortal>
      )}
      {settings.view.componentDimensionsVisible && isActive && (
        <SizeLabel reference="bottom-right" boundingRect={computedFace.boundingRect} />
      )}
      <RootPanelFace key={faceIdAboveRoot} componentId={faceIdAboveRoot} nestingLevel={nestingLevel} />
    </>
  )
}
