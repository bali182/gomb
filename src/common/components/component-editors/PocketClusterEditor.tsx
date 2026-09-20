import { type FC } from 'react'

import { Tabs } from '@chakra-ui/react'
import { useTranslation2 } from '../../hooks/useTranslation2'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { SectionGroup } from '../common/SectionGroup'
import { AnchorSection } from './sections/AnchorSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { PocketsSection } from './sections/PocketsSection'
import { SqueezeSection } from './sections/SqueezeSection'

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
  const { t } = useTranslation2()

  return (
    <Tabs.Root defaultValue="layout" display="flex" flexDirection="column" minH="0">
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value="layout">{t.project.editors.tabs.components.layout}</Tabs.Trigger>
        <Tabs.Trigger value="pockets">{t.project.editors.tabs.components.pockets}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="layout" display="flex" flex="1" minH="0" pt={0}>
        <SectionGroup.Root>
          <AutoSizeSection component={component} editable={editable} issues={issues} onChange={onChange} />
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
          <PocketsSection component={component} editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
