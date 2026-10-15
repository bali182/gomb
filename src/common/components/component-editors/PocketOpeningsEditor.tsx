import { Accordion, Button, Stack, type AccordionValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useState, type FC } from 'react'

import { PiPlusCircle } from 'react-icons/pi'
import type { ImmediateUpdater } from '../../hooks/useEditableModel'
import { useTranslation } from '../../hooks/useTranslation'
import { createPocketOpening } from '../../operations/subProject/utils/createPocketOpening'
import type { HasIdentitySchema } from '../../schemas/common'
import type { PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { getEditableSchema } from '../../utils/getEditableSchema'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningAccordionItem } from './PocketOpeningAccordionItem'
import { PocketAssignmentsSection } from './sections/PocketAssignmentsSection'

type PocketOpeningsEditorProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: ValidationIssuesSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
  onChangeImmediately: (update: ImmediateUpdater<PocketClusterSchema>) => void
}

export const PocketOpeningsEditor: FC<PocketOpeningsEditorProps> = ({
  component,
  editable,
  issues,
  onChange,
  onChangeImmediately,
}) => {
  const { t, language } = useTranslation()
  const [openIds, setOpenIds] = useState<string[]>([])

  const handleAdd = useCallback((): void => {
    onChangeImmediately(
      (
        current: EditableSchema<PocketClusterSchema>,
        currentValue: PocketClusterSchema,
      ): EditableSchema<PocketClusterSchema> => {
        const openings: readonly HasIdentitySchema[] = [currentValue.defaultOpening, ...currentValue.openings]
        const opening = createPocketOpening(openings, t.defaultNames.pocketOpening)
        return { ...current, openings: [...current.openings, getEditableSchema(opening, { language })] }
      },
    )
  }, [language, onChangeImmediately, t.defaultNames.pocketOpening])

  const handleDelete = useCallback(
    (id: string): void => {
      onChangeImmediately(
        (current: EditableSchema<PocketClusterSchema>): EditableSchema<PocketClusterSchema> => ({
          ...current,
          openings: current.openings.filter((opening) => opening.id !== id),
        }),
      )
      setOpenIds((current) => current.filter((openId) => openId !== id))
    },
    [onChangeImmediately],
  )

  const handleDefaultOpeningChange = useCallback(
    (defaultOpening: EditableSchema<PocketOpeningSchema>): void => {
      onChange({ ...editable, defaultOpening })
    },
    [editable, onChange],
  )

  const handleOpeningChange = useCallback(
    (updated: EditableSchema<PocketOpeningSchema>): void => {
      onChange({
        ...editable,
        openings: editable.openings.map((opening) => (opening.id === updated.id ? updated : opening)),
      })
    },
    [editable, onChange],
  )

  const handleAccordionChange = useCallback((details: AccordionValueChangeDetails): void => {
    setOpenIds(details.value)
  }, [])

  return (
    <>
      <SectionGroup.SectionFullWidthContent padded={false}>
        <Stack gap="3">
          <Accordion.Root multiple={false} collapsible value={openIds} onValueChange={handleAccordionChange} size="sm">
            <PocketOpeningAccordionItem
              pocketCluster={component}
              opening={component.defaultOpening}
              editable={editable.defaultOpening}
              issues={issues.defaultOpening}
              onChange={handleDefaultOpeningChange}
            />
            {component.openings.map((opening) => {
              const editableIndex = editable.openings.findIndex((item) => item.id === opening.id)
              const editableOpening = editable.openings[editableIndex]
              if (!isDefined(editableOpening)) {
                return undefined
              }
              return (
                <PocketOpeningAccordionItem
                  key={opening.id}
                  pocketCluster={component}
                  opening={opening}
                  editable={editableOpening}
                  issues={issues.openings[editableIndex]}
                  onChange={handleOpeningChange}
                  onDelete={() => handleDelete(opening.id)}
                />
              )
            })}
          </Accordion.Root>
          <Button size="xs" variant="outline" onClick={handleAdd} mx="3.5">
            <PiPlusCircle /> {t.project.editors.actions.pocketOpenings.add}
          </Button>
        </Stack>
      </SectionGroup.SectionFullWidthContent>
      <PocketAssignmentsSection component={component} editable={editable} onChange={onChange} />
    </>
  )
}
