import type { FC } from 'react'

import { Tabs } from '@chakra-ui/react'
import type { ImmediateUpdater } from '../../hooks/useEditableModel'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useTranslation } from '../../hooks/useTranslation'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningsEditor } from './PocketOpeningsEditor'
import { AnchorSection } from './sections/AnchorSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CardsSection } from './sections/CardsSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { PocketsSection } from './sections/PocketsSection'
import { SqueezeSection } from './sections/SqueezeSection'

type PocketClusterEditorProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: IssuesSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
  onChangeImmediately: (update: ImmediateUpdater<PocketClusterSchema>) => void
  parent: ComponentSchema
}

export const PocketClusterEditor: FC<PocketClusterEditorProps> = ({
  component,
  editable,
  issues,
  onChange,
  onChangeImmediately,
  parent,
}) => {
  const { t } = useTranslation()
  const { activeTab, onTabChange } = useFloatingEditorTab(component.id, 'layout')

  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange} display="flex" flexDirection="column" minH="0">
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value="layout">{t.project.editors.tabs.components.layout}</Tabs.Trigger>
        <Tabs.Trigger value="pockets">{t.project.editors.tabs.components.pockets}</Tabs.Trigger>
        <Tabs.Trigger value="pocket-openings">{t.project.editors.tabs.components.pocketOpenings}</Tabs.Trigger>
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
          <CardsSection editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value="pocket-openings" display="flex" flex="1" minH="0" pt="0">
        <SectionGroup.Root padded={false} spaced={false}>
          <PocketOpeningsEditor
            component={component}
            editable={editable}
            issues={issues}
            onChange={onChange}
            onChangeImmediately={onChangeImmediately}
          />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
