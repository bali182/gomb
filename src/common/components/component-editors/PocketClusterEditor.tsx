import { Button, Text } from '@chakra-ui/react'
import type { FC } from 'react'
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
  const hasFront = component.children.some((id) => subProject.components[id]?.type === 'front-pocket')
  return (
    <SectionGroup.Root>
      <AutoSizeSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <AnchorSection<PocketClusterSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
      <StretchSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <PocketsSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <CardsSection editable={editable} issues={issues} onChange={onChange} />
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
  )
}
