import { useMemo, type FC } from 'react'
import { useSubProject } from '../../hooks/useSubProject'
import type { ComponentSchema } from '../../schemas/components'
import type { ComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { TargetComponentComboBox } from '../common/TargetComponentComboBox'

type StitchLineRenderTargetComboboxProps = {
  stitchLine: ComponentBoundsStitchLineSchema
  onChange: (componentId: string) => void
  onReset: () => void
}

export const StitchLineRenderTargetCombobox: FC<StitchLineRenderTargetComboboxProps> = ({
  onChange,
  onReset,
  stitchLine,
}) => {
  const { subProject } = useSubProject()
  const components = useMemo<ComponentSchema[]>(() => Object.values(subProject.components), [subProject.components])
  const displayedTarget = useMemo<ComponentSchema>(() => {
    const subProjectAccessors = accessors.subProject(subProject)

    if (isDefined(stitchLine.onTop)) {
      return subProjectAccessors.component.byId(stitchLine.onTop)
    }

    if (stitchLine.targetType === 'component') {
      return subProjectAccessors.component.byId(stitchLine.targetId)
    }

    return subProjectAccessors.component.byId(subProjectAccessors.hole.byId(stitchLine.targetId).componentId)
  }, [stitchLine.onTop, stitchLine.targetId, stitchLine.targetType, subProject])

  return (
    <TargetComponentComboBox
      components={components}
      selectedComponent={displayedTarget}
      onChange={onChange}
      onReset={onReset}
      resetDisabled={!isDefined(stitchLine.onTop)}
    />
  )
}
