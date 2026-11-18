import { useCallback, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import type { RootPanelSchema } from '../../schemas/components'
import type { ComputedRootPanelFaceSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { RootPanelFace } from './RootPanelFace'
import { SizeLabel } from './SizeLabel'

type RootPanelProps = { componentId: string; nestingLevel: number }
export const RootPanel: FC<RootPanelProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, rootPanelFaceId, selection } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const rootPanel = useComponent<RootPanelSchema>(componentId)
  const faceId = rootPanelFaceId === rootPanel.backFaceId ? rootPanel.backFaceId : rootPanel.frontFaceId
  const computedFace = useComputedComponent<ComputedRootPanelFaceSchema>(faceId)
  const pathData = usePath(computedFace.path)
  const isActive = selection.isSelected(rootPanel) || selection.isHovered(rootPanel)
  const styleParams: DrawAreaComponentStyleParams = { component: rootPanel, nestingLevel }

  const handlePointerEnter = useCallback((): void => {
    selection.hover(rootPanel)
  }, [rootPanel, selection])

  const handlePointerLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const handleClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      selection.select(rootPanel)
    },
    [rootPanel, selection],
  )

  return (
    <>
      <path
        d={pathData}
        fill={componentStyles.getBackgroundColor(styleParams)}
        filter={componentStyles.getFilter(styleParams)}
        stroke={componentStyles.getBorderColor(styleParams)}
        strokeWidth={componentStyles.getBorderThickness(styleParams)}
        data-component-id={rootPanel.id}
        onPointerEnter={isInteractive ? handlePointerEnter : undefined}
        onPointerLeave={isInteractive ? handlePointerLeave : undefined}
        onClick={isInteractive ? handleClick : undefined}
      />
      {settings.view.componentDimensionsVisible && isActive && (
        <SizeLabel reference="bottom-right" boundingRect={computedFace.boundingRect} />
      )}
      <RootPanelFace componentId={faceId} nestingLevel={nestingLevel} />
    </>
  )
}
