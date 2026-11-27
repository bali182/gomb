import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useOptionalSvgFace } from '../../contexts/SvgFaceContext'
import { useSubProject } from '../../hooks/useSubProject'
import { getHorizontalReflectionTransform } from '../../logic/geometryUtils'
import { svgSelectionPortalRef } from '../../portalRefs'
import { isDefined } from '../../utils/isDefined'

type SelectionPortalProps = {
  children: ReactNode
}

export const SelectionPortal = ({ children }: SelectionPortalProps) => {
  const face = useOptionalSvgFace()
  const { computedAccessor } = useSubProject()
  const root = computedAccessor.component.rootPanel()
  const axisX = root.boundingRect.x.plus(root.boundingRect.width.dividedBy(2))

  if (!isDefined(svgSelectionPortalRef.current)) {
    return null
  }

  return createPortal(
    <g transform={face?.direction === 'reverse' ? getHorizontalReflectionTransform(axisX) : undefined}>{children}</g>,
    svgSelectionPortalRef.current,
  )
}
