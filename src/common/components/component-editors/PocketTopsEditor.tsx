import { Accordion, Button, Stack, type AccordionValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useState, type FC } from 'react'

import type { ImmediateUpdater } from '../../hooks/useEditableModel'
import { useTranslation } from '../../hooks/useTranslation'
import { createPocketTop } from '../../operations/subProject/utils/createPocketTop'
import type { HasIdentitySchema } from '../../schemas/common'
import type { PocketClusterSchema, PocketTopSchema } from '../../schemas/components'
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
  const [openIds, setOpenIds] = useState<string[]>([component.defaultPocketTop.id])

  const handleAdd = useCallback((): void => {
    let addedTopId: string | undefined
    onChangeImmediately(
      (
        current: EditableSchema<PocketClusterSchema>,
        currentValue: PocketClusterSchema,
      ): EditableSchema<PocketClusterSchema> => {
        const pocketTops: readonly HasIdentitySchema[] = [currentValue.defaultPocketTop, ...currentValue.pocketTops]
        const pocketTop = createPocketTop(pocketTops, t.defaultNames.pocketTop)
        addedTopId = pocketTop.id
        return { ...current, pocketTops: [...current.pocketTops, getEditableSchema(pocketTop, { language })] }
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
          pocketTops: current.pocketTops.filter((top) => top.id !== id),
        }),
      )
      setOpenIds((current) => current.filter((openId) => openId !== id))
    },
    [onChangeImmediately],
  )

  const handleDefaultTopChange = useCallback(
    (defaultPocketTop: EditableSchema<PocketTopSchema>): void => {
      onChange({ ...editable, defaultPocketTop })
    },
    [editable, onChange],
  )

  const handleTopChange = useCallback(
    (updated: EditableSchema<PocketTopSchema>): void => {
      onChange({ ...editable, pocketTops: editable.pocketTops.map((top) => (top.id === updated.id ? updated : top)) })
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
              pocketTop={component.defaultPocketTop}
              editable={editable.defaultPocketTop}
              issues={issues.defaultPocketTop}
              onChange={handleDefaultTopChange}
            />
            {component.pocketTops.map((top) => {
              const editableIndex = editable.pocketTops.findIndex((item) => item.id === top.id)
              const editableTop = editable.pocketTops[editableIndex]
              if (!isDefined(editableTop)) {
                return undefined
              }
              return (
                <PocketTopAccordionItem
                  key={top.id}
                  pocketCluster={component}
                  pocketTop={top}
                  editable={editableTop}
                  issues={issues.pocketTops[editableIndex]}
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
