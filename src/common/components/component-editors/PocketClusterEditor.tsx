import { type FC } from 'react'

import { Tabs } from '@chakra-ui/react'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { useTranslation } from '../../translations/translation'
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
  const t = useTranslation()

  return (
    <Tabs.Root defaultValue="layout" display="flex" flexDirection="column" minH="0">
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value="layout">{t.component.editor.tabs.layout}</Tabs.Trigger>
        <Tabs.Trigger value="pockets">{t.component.editor.tabs.pockets}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="layout" display="flex" flex="1" minH="0" pt={0}>
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
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value="pockets" display="flex" flex="1" minH="0" pt={0}>
        <SectionGroup.Root>
          <PocketClusterSettingsSection component={component} editable={editable} issues={issues} onChange={onChange} />
          <TPocketShapeSection component={component} editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
