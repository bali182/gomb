import { Accordion, Button, Stack, type AccordionValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useState, type FC } from 'react'

import type { ImmediateUpdater } from '../../hooks/useEditableModel'
import { useTranslation } from '../../hooks/useTranslation'
import { createPocketTop } from '../../operations/subProject/utils/createPocketTop'
import type { HasIdentitySchema } from '../../schemas/common'
import type { PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { getEditableSchema } from '../../utils/getEditableSchema'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'
import { PocketTopAccordionItem } from './PocketTopAccordionItem'
import { PocketAssignmentsSection } from './sections/PocketAssignmentsSection'

type PocketTopsEditorProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: ValidationIssuesSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
  onChangeImmediately: (update: ImmediateUpdater<PocketClusterSchema>) => void
}

export const PocketTopsEditor: FC<PocketTopsEditorProps> = ({
  component,
  editable,
  issues,
  onChange,
  onChangeImmediately,
}) => {
  const { t, language } = useTranslation()
  const [openIds, setOpenIds] = useState<string[]>([component.defaultOpening.id])

  const handleAdd = useCallback((): void => {
    let addedTopId: string | undefined
    onChangeImmediately(
      (
        current: EditableSchema<PocketClusterSchema>,
        currentValue: PocketClusterSchema,
      ): EditableSchema<PocketClusterSchema> => {
        const pocketTops: readonly HasIdentitySchema[] = [currentValue.defaultOpening, ...currentValue.openings]
        const pocketTop = createPocketTop(pocketTops, t.defaultNames.pocketTop)
        addedTopId = pocketTop.id
        return { ...current, openings: [...current.openings, getEditableSchema(pocketTop, { language })] }
      },
    )
    if (isDefined(addedTopId)) {
      setOpenIds([addedTopId])
    }
  }, [language, onChangeImmediately, t.defaultNames.pocketTop])

  const handleDelete = useCallback(
    (id: string): void => {
      onChangeImmediately(
        (current: EditableSchema<PocketClusterSchema>): EditableSchema<PocketClusterSchema> => ({
          ...current,
          openings: current.openings.filter((top) => top.id !== id),
        }),
      )
      setOpenIds((current) => current.filter((openId) => openId !== id))
    },
    [onChangeImmediately],
  )

  const handleDefaultTopChange = useCallback(
    (defaultPocketTop: EditableSchema<PocketOpeningSchema>): void => {
      onChange({ ...editable, defaultOpening: defaultPocketTop })
    },
    [editable, onChange],
  )

  const handleTopChange = useCallback(
    (updated: EditableSchema<PocketOpeningSchema>): void => {
      onChange({ ...editable, openings: editable.openings.map((top) => (top.id === updated.id ? updated : top)) })
    },
    [editable, onChange],
  )

  const handleAccordionChange = useCallback((details: AccordionValueChangeDetails): void => {
    setOpenIds(details.value)
  }, [])

  return (
    <>
      <SectionGroup.SectionFullWidthContent>
        <Stack gap="3">
          <Accordion.Root multiple={false} collapsible value={openIds} onValueChange={handleAccordionChange} size="sm">
            <PocketTopAccordionItem
              pocketCluster={component}
              pocketTop={component.defaultOpening}
              editable={editable.defaultOpening}
              issues={issues.defaultOpening}
              onChange={handleDefaultTopChange}
            />
            {component.openings.map((top) => {
              const editableIndex = editable.openings.findIndex((item) => item.id === top.id)
              const editableTop = editable.openings[editableIndex]
              if (!isDefined(editableTop)) {
                return undefined
              }
              return (
                <PocketTopAccordionItem
                  key={top.id}
                  pocketCluster={component}
                  pocketTop={top}
                  editable={editableTop}
                  issues={issues.openings[editableIndex]}
                  onChange={handleTopChange}
                  onDelete={() => handleDelete(top.id)}
                />
              )
            })}
          </Accordion.Root>
          <Button size="xs" variant="outline" onClick={handleAdd}>
            {t.project.editors.actions.pocketTops.add}
          </Button>
        </Stack>
      </SectionGroup.SectionFullWidthContent>
      <PocketAssignmentsSection component={component} editable={editable} onChange={onChange} />
    </>
  )
}
