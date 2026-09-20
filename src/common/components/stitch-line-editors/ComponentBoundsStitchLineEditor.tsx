import { type FC } from 'react'

import { Tabs } from '@chakra-ui/react'
import { useTranslation2 } from '../../hooks/useTranslation2'
import type { EditableSchema } from '../../schemas/editable'
import type { ComponentBoundsStitchLineSchema, StitchLineCommonConfigSchema } from '../../schemas/stitching'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from '../component-editors/sections/CornerRadiusSection'
import { StitchSidesAndCornersSection } from './sections/StitchSidesAndCornersSection'
import { StitchingSettingsSection } from './sections/StitchingSettingsSection'

type ComponentBoundsStitchLineEditorProps = {
  value: ComponentBoundsStitchLineSchema
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  issues: ValidationIssuesSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
  onReset: (key: keyof StitchLineCommonConfigSchema) => void
  resolvedEditable: EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<ComponentBoundsStitchLineSchema>
}

export const ComponentBoundsStitchLineEditor: FC<ComponentBoundsStitchLineEditorProps> = ({
  value,
  editable,
  issues,
  onChange,
  onReset,
  resolvedEditable,
}) => {
  const { t } = useTranslation2()
  return (
    <Tabs.Root defaultValue="settings">
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value="settings">{t.project.editors.tabs.stitchLines.settings}</Tabs.Trigger>
        <Tabs.Trigger value="overrides">{t.project.editors.tabs.stitchLines.overrides}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="settings" pt={0}>
        <SectionGroup.Root>
          <StitchSidesAndCornersSection editable={editable} issues={issues} onChange={onChange} />
          <CornerRadiusSection value={value} editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value="overrides" pt={0}>
        <SectionGroup.Root>
          <StitchingSettingsSection<ComponentBoundsStitchLineSchema>
            editable={editable}
            issues={issues}
            onChange={onChange}
            onReset={onReset}
            resolvedEditable={resolvedEditable}
          />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
