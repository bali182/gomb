import { Accordion, Menu, Portal, type AccordionValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'

import { PiPlusCircle } from 'react-icons/pi'
import type { ImmediateUpdater } from '../../hooks/useEditableModel'
import { useTranslation } from '../../hooks/useTranslation'
import { createPocketOpening } from '../../operations/subProject/utils/createPocketOpening'
import { portalRef } from '../../portalRef'
import type { HasIdentitySchema } from '../../schemas/common'
import type { PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { getEditableSchema } from '../../utils/getEditableSchema'
import { isDefined } from '../../utils/isDefined'
import { noIssues } from '../../utils/issueUtils'
import { SectionGroup } from '../common/SectionGroup'
import { SectionHeaderButton } from '../common/SectionHeaderButton'
import { PocketOpeningAccordionItem } from './PocketOpeningAccordionItem'
import { PocketAssignmentsSection } from './sections/PocketAssignmentsSection'

const openingTypes: PocketOpeningSchema['type'][] = ['straight', 'recessed', 'slanted']

type PocketOpeningsEditorProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  issues: IssuesSchema<PocketClusterSchema>
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

  const defaultOpeningIssues = issues.defaultOpening ?? noIssues<PocketOpeningSchema>()
  const openingIssues = useMemo<IssuesSchema<PocketOpeningSchema>[]>(
    () => editable.openings.map((_, index) => issues.openings?.[index] ?? noIssues<PocketOpeningSchema>()),
    [editable.openings, issues.openings],
  )

  const handleClose = useCallback((id: string): void => {
    setOpenIds((current: string[]): string[] =>
      current.includes(id) ? current.filter((openId) => openId !== id) : current,
    )
  }, [])

  const handleAdd = useCallback(
    (type: PocketOpeningSchema['type']): void => {
      onChangeImmediately(
        (
          current: EditableSchema<PocketClusterSchema>,
          currentValue: PocketClusterSchema,
        ): EditableSchema<PocketClusterSchema> => {
          const openings: readonly HasIdentitySchema[] = [currentValue.defaultOpening, ...currentValue.openings]
          const opening = createPocketOpening(type, openings, t.project.editors.enums.components.pocketOpening[type])
          return { ...current, openings: [...current.openings, getEditableSchema(opening, { language })] }
        },
      )
    },
    [language, onChangeImmediately, t],
  )

  const handleDelete = useCallback(
    (id: string): void => {
      onChangeImmediately(
        (current: EditableSchema<PocketClusterSchema>): EditableSchema<PocketClusterSchema> => ({
          ...current,
          openings: current.openings.filter((opening) => opening.id !== id),
        }),
      )
      handleClose(id)
    },
    [handleClose, onChangeImmediately],
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
      <SectionGroup.ContentGroup>
        <SectionGroup.SectionHeader
          rightAddon={
            <Menu.Root size="sm" positioning={{ sameWidth: false, placement: 'bottom-end' }}>
              <Menu.Trigger asChild>
                <SectionHeaderButton>
                  <PiPlusCircle /> {t.project.editors.actions.pocketOpenings.add}
                </SectionHeaderButton>
              </Menu.Trigger>
              <Portal container={portalRef}>
                <Menu.Positioner>
                  <Menu.Content width="max-content">
                    {openingTypes.map((type) => (
                      <Menu.Item key={type} value={type} whiteSpace="nowrap" onSelect={() => handleAdd(type)}>
                        <Menu.ItemText>{t.project.editors.enums.components.pocketOpening[type]}</Menu.ItemText>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          }
        >
          {t.project.editors.sections.components.pocketOpening.title}
        </SectionGroup.SectionHeader>
        <SectionGroup.SectionFullWidthContent padded={false}>
          <Accordion.Root
            multiple={false}
            collapsible
            value={openIds}
            onValueChange={handleAccordionChange}
            size="sm"
            borderTopWidth="1px"
          >
            <PocketOpeningAccordionItem
              pocketCluster={component}
              opening={component.defaultOpening}
              editable={editable.defaultOpening}
              issues={defaultOpeningIssues}
              onChange={handleDefaultOpeningChange}
              onClose={handleClose}
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
                  issues={openingIssues[editableIndex]}
                  onChange={handleOpeningChange}
                  onClose={handleClose}
                  onDelete={() => handleDelete(opening.id)}
                />
              )
            })}
          </Accordion.Root>
        </SectionGroup.SectionFullWidthContent>
      </SectionGroup.ContentGroup>
      <PocketAssignmentsSection component={component} editable={editable} onChange={onChange} />
    </>
  )
}
