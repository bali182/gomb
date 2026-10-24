import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { PointSchema } from '../../schemas/geometry'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Label } from './Label'

type PocketClusterSelectionLabelProps = {
  clusterId: string
}

export const PocketClusterSelectionLabel: FC<PocketClusterSelectionLabelProps> = ({ clusterId }) => {
  const { isInteractive, selection } = useDrawAreaContext()
  const cluster = useComponent<PocketClusterSchema>(clusterId)
  const computed = useComputedComponent<ComputedPocketClusterSchema>(clusterId)

  const showLabel = useMemo<boolean>(() => {
    if (!isInteractive || !isDefined(selection.hovered)) {
      return false
    }
    return (
      selection.isHovered(cluster) ||
      (narrowers.is.pocket(selection.hovered) && cluster.children.includes(selection.hovered.id))
    )
  }, [isInteractive, selection, cluster])

  const getLabelPosition = useCallback((): PointSchema => {
    const { x, y, width, height } = computed.boundingRect
    switch (cluster.orientation) {
      case 'up':
        return { x: x.plus(width.dividedBy(2)), y: y.plus(height) }
      case 'down':
        return { x: x.plus(width.dividedBy(2)), y }
      case 'left':
        return { x: x.plus(width), y: y.plus(height.dividedBy(2)) }
      case 'right':
        return { x, y: y.plus(height.dividedBy(2)) }
    }
  }, [computed.boundingRect, cluster.orientation])

  const labelRotation = useMemo<number>(() => {
    switch (cluster.orientation) {
      case 'up':
      case 'down':
        return 0
      case 'left':
        return 90
      case 'right':
        return -90
    }
  }, [cluster.orientation])

  const handleLabelEnter = useCallback((): void => {
    selection.hover(cluster)
  }, [selection, cluster])

  const handleLabelLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const onClick = useCallback(
    (event: MouseEvent): void => {
      event.stopPropagation()
      selection.select(cluster)
    },
    [cluster, selection],
  )

  if (!showLabel) {
    return null
  }

  return (
    <Label
      icon={getModelIcon(cluster)}
      label={cluster.name}
      getPosition={getLabelPosition}
      rotation={labelRotation}
      onClick={onClick}
      onPointerEnter={handleLabelEnter}
      onPointerLeave={handleLabelLeave}
    />
  )
}
