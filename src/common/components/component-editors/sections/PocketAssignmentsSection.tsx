import {
  HStack,
  Select,
  Table,
  Text,
  createListCollection,
  type ListCollection,
  type SelectValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiArrowRight } from 'react-icons/pi'

import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketClusterSchema, PocketTopSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { PocketTypeIcon, type PocketType } from '../../common/PocketTypeIcon'
import { SectionGroup } from '../../common/SectionGroup'

type PocketAssignmentsSectionProps = {
  component: PocketClusterSchema
  editable: EditableSchema<PocketClusterSchema>
  onChange: (updated: EditableSchema<PocketClusterSchema>) => void
}

type PocketAssignmentRow = {
  pocketNumber: number
  pocketType: PocketType
  selectedValue: string[]
  onChange: (details: SelectValueChangeDetails<PocketTopSchema>) => void
}

export const PocketAssignmentsSection: FC<PocketAssignmentsSectionProps> = ({ component, editable, onChange }) => {
  const { t } = useTranslation()

  const collection = useMemo<ListCollection<PocketTopSchema>>(
    () =>
      createListCollection<PocketTopSchema>({
        items: [component.defaultPocketTop, ...component.pocketTops],
        itemToString: (top) => top.name,
        itemToValue: (top) => top.id,
      }),
    [component.defaultPocketTop, component.pocketTops],
  )

  const handleMappingChange = useCallback(
    (pocketNumber: number, pocketTop: PocketTopSchema): void => {
      const pocketTopMapping: Partial<Record<number, string>> = { ...editable.pocketTopMapping }
      if (pocketTop.id === component.defaultPocketTop.id) {
        delete pocketTopMapping[pocketNumber]
      } else {
        pocketTopMapping[pocketNumber] = pocketTop.id
      }
      onChange({ ...editable, pocketTopMapping })
    },
    [component.defaultPocketTop.id, editable, onChange],
  )

  const rows = useMemo<PocketAssignmentRow[]>(() => {
    const pocketTopAccessor = accessors.pocketCluster(component)

    return Array.from({ length: component.pocketCount }, (_, index): PocketAssignmentRow => {
      const pocketNumber = index + 1
      return {
        pocketNumber,
        pocketType: pocketNumber === component.pocketCount ? 'front-pocket' : 't-pocket',
        selectedValue: [pocketTopAccessor.pocketTop(pocketNumber).id],
        onChange: (details: SelectValueChangeDetails<PocketTopSchema>): void => {
          const top = details.items[0]
          if (isDefined(top)) {
            handleMappingChange(pocketNumber, top)
          }
        },
      }
    })
  }, [component, handleMappingChange])

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>
        {t.project.editors.sections.components.pocketAssignments.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent>
        <Table.Root size="sm" tableLayout="fixed" width="full">
          <Table.Body>
            {rows.map(({ pocketNumber, pocketType, selectedValue, onChange: handleChange }) => (
              <Table.Row key={pocketNumber}>
                <Table.Cell width="35%" px="0">
                  <HStack gap="2">
                    <PocketTypeIcon type={pocketType} />
                    <Text textStyle="sm">
                      {t.project.editors.controls.pocketAssignments.pocket(pocketNumber)}
                      <Text as="span" display="block" color="fg.muted" textStyle="xs">
                        {pocketType === 'front-pocket'
                          ? t.project.editors.controls.pocketAssignments.frontPocket
                          : t.project.editors.controls.pocketAssignments.tPocket}
                      </Text>
                    </Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell width="8%" px="0" color="fg.muted">
                  <PiArrowRight />
                </Table.Cell>
                <Table.Cell px="0">
                  <Select.Root
                    collection={collection}
                    value={selectedValue}
                    onValueChange={handleChange}
                    positioning={{ strategy: 'fixed' }}
                    size="xs"
                    width="full"
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText
                          placeholder={t.project.editors.sections.components.pocketAssignments.pocketTopMapping.label}
                        />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {collection.items.map((top) => (
                          <Select.Item key={top.id} item={top}>
                            {top.name}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Section>
  )
}
