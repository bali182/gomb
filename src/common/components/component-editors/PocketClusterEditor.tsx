import { Button, Tabs, Text } from '@chakra-ui/react'
import type { FC } from 'react'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { AnchorSection } from './sections/AnchorSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CardsSection } from './sections/CardsSection'
import { PocketsSection } from './sections/PocketsSection'
import { StretchSection } from './sections/StretchSection'

type PocketClusterEditorProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: IssuesSchema<PocketClusterSchema>
  onChange: (value: EditableSchema<PocketClusterSchema>) => void
  parent: ComponentSchema
}

const PocketClusterTabs = {
  layout: 'layout',
  cards: 'cards',
}

export const PocketClusterEditor: FC<PocketClusterEditorProps> = ({
  component,
  editable,
  issues,
  onChange,
  parent,
}) => {
  const { t } = useTranslation()
  const { subProject } = useSubProject()
  const { addComponent } = useSubProjectOperations()
  const { activeTab, onTabChange } = useFloatingEditorTab({
    modelId: component.id,
    defaultTab: PocketClusterTabs.layout,
    tabs: PocketClusterTabs,
  })
  const hasFront = component.children.some((id) => subProject.components[id]?.type === 'front-pocket')
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value={PocketClusterTabs.layout}>{t.project.editors.tabs.components.layout}</Tabs.Trigger>
        <Tabs.Trigger value={PocketClusterTabs.cards}>{t.project.editors.tabs.components.cards}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={PocketClusterTabs.layout} pt={0}>
        <SectionGroup.Root>
          <AutoSizeSection component={component} editable={editable} issues={issues} onChange={onChange} />
          <AnchorSection<PocketClusterSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
          <StretchSection component={component} editable={editable} issues={issues} onChange={onChange} />
          <PocketsSection component={component} editable={editable} issues={issues} onChange={onChange} />
          {!hasFront && (
            <SectionGroup.ContentGroup>
              <SectionGroup.SectionFullWidthContent>
                <Text color="fg.error">{t.project.editors.controls.pockets.missingFront}</Text>
                <Button size="xs" onClick={() => addComponent(component.id, 'front-pocket', 'end')}>
                  {t.project.editors.actions.components.addFrontPocket}
                </Button>
              </SectionGroup.SectionFullWidthContent>
            </SectionGroup.ContentGroup>
          )}
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={PocketClusterTabs.cards} pt={0}>
        <SectionGroup.Root>
          <CardsSection editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
