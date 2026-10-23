import { useCallback, useMemo, type FC } from 'react'
import type { HasCornerRadiusValuesSchema } from '../../schemas/common'
import type { FrontPocketSchema, PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { PocketOpeningSection } from './sections/PocketOpeningSection'
type FrontPocketEditorProps = {
  component: FrontPocketSchema
  editable: EditableSchema<FrontPocketSchema>
  issues: IssuesSchema<FrontPocketSchema>
  parent: PocketClusterSchema
  onChange: (value: EditableSchema<FrontPocketSchema>) => void
}
export const FrontPocketEditor: FC<FrontPocketEditorProps> = ({ component, editable, issues, parent, onChange }) => {
  const handleOpeningChange = useCallback(
    (opening: EditableSchema<PocketOpeningSchema>): void => onChange({ ...editable, opening }),
    [editable, onChange],
  )
  const disabledFields = useMemo<readonly (keyof HasCornerRadiusValuesSchema)[]>(() => {
    switch (parent.orientation) {
      case 'up':
        return ['topLeftRadius', 'topRightRadius']
      case 'down':
        return ['bottomLeftRadius', 'bottomRightRadius']
      case 'left':
        return ['topLeftRadius', 'bottomLeftRadius']
      case 'right':
        return ['topRightRadius', 'bottomRightRadius']
    }
  }, [parent.orientation])
  return (
    <SectionGroup.Root>
      <CornerRadiusSection
        value={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
        disabledFields={disabledFields}
      />
      <LayoutSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <PocketOpeningSection
        cluster={parent}
        editable={editable.opening}
        issues={issues.opening}
        onChange={handleOpeningChange}
      />
    </SectionGroup.Root>
  )
}
