import { Button } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiWarningCircle } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { CommonEmptyState } from '../common/CommonEmptyState'
import { SectionGroup } from '../common/SectionGroup'
import { AnchorSection } from './sections/AnchorSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
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
  const { isComputing } = useEditorContext()
  const { subProject } = useSubProject()
  const { addComponent } = useSubProjectOperations()
  const accessor = accessors.subProject(subProject)
  const hasFront = component.children.some((id) => {
    return isDefined(accessor.optional.component.frontPocket(id))
  })
  if (!hasFront) {
    return (
      <CommonEmptyState
        icon={<PiWarningCircle />}
        title={t.project.editors.emptyStates.missingFrontPocket.title}
        description={t.project.editors.emptyStates.missingFrontPocket.description}
        content={
          <Button disabled={isComputing} size="xs" onClick={() => addComponent(component.id, 'front-pocket', 'end')}>
            {t.project.editors.emptyStates.missingFrontPocket.action}
          </Button>
        }
      />
    )
  }
  return (
    <SectionGroup.Root>
      <PocketsSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <AutoSizeSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <AnchorSection<PocketClusterSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
      <StretchSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
    </SectionGroup.Root>
  )
}
