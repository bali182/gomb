import { type FC } from 'react'

import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { SectionGroup } from '../common/SectionGroup'
import { AnchorSection } from './sections/AnchorSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { FillableSizeSection } from './sections/FillableSizeSection'
import { LayoutSection } from './sections/LayoutSection'
import { PocketClusterSettingsSection } from './sections/PocketClusterSettingsSection'
import { SqueezeSection } from './sections/SqueezeSection'
import { TPocketShapeSection } from './sections/TPocketShapeSection'

type PocketClusterEditorProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: ValidationIssuesSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
  parent: ComponentSchema
}

export const PocketClusterEditor: FC<PocketClusterEditorProps> = ({
  component,
  editable,
  issues,
  onChange,
  parent,
}) => {
  return (
    <SectionGroup.Root>
      <FillableSizeSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <AnchorSection<PocketClusterSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
      <SqueezeSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<PocketClusterSchema>
        value={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <LayoutSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <PocketClusterSettingsSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <TPocketShapeSection component={component} editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Root>
  )
}
