import { useCallback, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import type { RootPanelFaceSchema, RootPanelSchema } from '../../schemas/components'
import type { ComputedRootPanelFaceSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { RootPanelFace } from './RootPanelFace'
import { SizeLabel } from './SizeLabel'

type RootPanelProps = {
  componentId: string
  nestingLevel: number
  faceIdAboveRoot: string
}
export const RootPanel: FC<RootPanelProps> = ({ componentId, nestingLevel, faceIdAboveRoot }) => {
  const { componentStyles, isInteractive, selection } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const rootPanel = useComponent<RootPanelSchema>(componentId)
  const visibleFace = useComponent<RootPanelFaceSchema>(faceIdAboveRoot)
  const inactiveFaceId = faceIdAboveRoot === rootPanel.frontFaceId ? rootPanel.backFaceId : rootPanel.frontFaceId
  const computedFace = useComputedComponent<ComputedRootPanelFaceSchema>(faceIdAboveRoot)
  const pathData = usePath(computedFace.path)
  const isRootActive = selection.isSelected(rootPanel) || selection.isHovered(rootPanel)
  const isActive = isRootActive || selection.isSelected(visibleFace) || selection.isHovered(visibleFace)
  const styleParams: DrawAreaComponentStyleParams = { component: rootPanel, nestingLevel, faceIdAboveRoot }
  const outlineStyleParams: DrawAreaComponentStyleParams = {
    component: isRootActive ? rootPanel : visibleFace,
    nestingLevel,
  }

  const handlePointerEnter = useCallback((): void => {
    selection.hover(visibleFace)
  }, [visibleFace, selection])

  const handlePointerLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const handleClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      selection.select(visibleFace)
    },
    [visibleFace, selection],
  )

  return (
    <>
      <RootPanelFace
        key={inactiveFaceId}
        componentId={inactiveFaceId}
        nestingLevel={nestingLevel}
        direction="reverse"
      />
      <path
        d={pathData}
        fill={componentStyles.getBackgroundColor(styleParams)}
        filter={componentStyles.getFilter(outlineStyleParams)}
        stroke={componentStyles.getBorderColor(outlineStyleParams)}
        strokeWidth={componentStyles.getBorderThickness(outlineStyleParams)}
        data-component-id={rootPanel.id}
        onPointerEnter={isInteractive ? handlePointerEnter : undefined}
        onPointerLeave={isInteractive ? handlePointerLeave : undefined}
        onClick={isInteractive ? handleClick : undefined}
      />
      {settings.view.componentDimensionsVisible && isActive && (
        <SizeLabel reference="bottom-right" boundingRect={computedFace.boundingRect} />
      )}
      <RootPanelFace key={faceIdAboveRoot} componentId={faceIdAboveRoot} nestingLevel={nestingLevel} />
    </>
  )
}
