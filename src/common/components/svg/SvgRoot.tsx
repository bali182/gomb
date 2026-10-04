import { VIEWBOX_PADDING } from '../../constants/drawing'
import { useMeasurement } from '../../hooks/useMeasurement'
import { useSubProject } from '../../hooks/useSubProject'
import { getViewBox } from '../../utils/getViewBox'
import { MeasurementOverlay } from './MeasurementOverlay'
import { RootPanel } from './RootPanel'
import { svgLabelsPortalRef } from './svgLabelsPortalRef'

export const SvgRoot = () => {
  const { isMeasuring } = useMeasurement()
  const { computedSubProject: computedProject } = useSubProject()

  const viewBox = getViewBox(computedProject.viewBox, VIEWBOX_PADDING)
  const svgWidth = computedProject.viewBox.width.plus(VIEWBOX_PADDING * 2)
  const svgHeight = computedProject.viewBox.height.plus(VIEWBOX_PADDING * 2)

  return (
    <svg
      width={`${svgWidth.toString()}mm`}
      height={`${svgHeight.toString()}mm`}
      style={{ display: 'block' }}
      viewBox={viewBox}
    >
      <RootPanel componentId={computedProject.root} nestingLevel={0} />
      <g ref={svgLabelsPortalRef} pointerEvents="none" />
      {isMeasuring && <MeasurementOverlay />}
    </svg>
  )
}
