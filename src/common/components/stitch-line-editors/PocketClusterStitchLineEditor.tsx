import { type FC } from 'react'

import { Tabs } from '@chakra-ui/react'
import { useTranslation2 } from '../../hooks/useTranslation2'
import type { EditableSchema } from '../../schemas/editable'
import type { PocketClusterStitchLineSchema, StitchLineCommonConfigSchema } from '../../schemas/stitching'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { SectionGroup } from '../common/SectionGroup'
import { PocketStitchingSection } from './sections/PocketStitchingSection'
import { StitchingSettingsSection } from './sections/StitchingSettingsSection'

type PocketClusterStitchLineEditorProps = {
  editable: EditableSchema<PocketClusterStitchLineSchema>
  issues: ValidationIssuesSchema<PocketClusterStitchLineSchema>
  onChange: (updated: EditableSchema<PocketClusterStitchLineSchema>) => void
  onReset: (key: keyof StitchLineCommonConfigSchema) => void
  resolvedEditable: EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<PocketClusterStitchLineSchema>
}

export const PocketClusterStitchLineEditor: FC<PocketClusterStitchLineEditorProps> = ({
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
          <PocketStitchingSection editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value="overrides" pt={0}>
        <SectionGroup.Root>
          <StitchingSettingsSection<PocketClusterStitchLineSchema>
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
