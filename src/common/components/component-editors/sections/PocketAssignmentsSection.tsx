import {
  Flex,
  Grid,
  HStack,
  Select,
  Text,
  createListCollection,
  type ListCollection,
  type SelectValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PiArrowRight } from 'react-icons/pi'

import { useTranslation } from '../../../hooks/useTranslation'
import type { PocketClusterSchema, PocketOpeningSchema } from '../../../schemas/components'
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
  onChange: (details: SelectValueChangeDetails<PocketOpeningSchema>) => void
}

export const PocketAssignmentsSection: FC<PocketAssignmentsSectionProps> = ({ component, editable, onChange }) => {
  const { t } = useTranslation()

  const collection = useMemo<ListCollection<PocketOpeningSchema>>(
    () =>
      createListCollection<PocketOpeningSchema>({
        items: [component.defaultOpening, ...component.openings],
        itemToString: (opening) => opening.name,
        itemToValue: (opening) => opening.id,
      }),
    [component.defaultOpening, component.openings],
  )

  const handleMappingChange = useCallback(
    (pocketNumber: number, opening: PocketOpeningSchema): void => {
      const openingMapping: Partial<Record<number, string>> = { ...editable.openingMapping }
      if (opening.id === component.defaultOpening.id) {
        delete openingMapping[pocketNumber]
      } else {
        openingMapping[pocketNumber] = opening.id
      }
      onChange({ ...editable, openingMapping })
    },
    [component.defaultOpening.id, editable, onChange],
  )

  const rows = useMemo<PocketAssignmentRow[]>(() => {
    const openingAccessor = accessors.pocketCluster(component)

    return Array.from({ length: component.pocketCount }, (_, index): PocketAssignmentRow => {
      const pocketNumber = index + 1
      return {
        pocketNumber,
        pocketType: pocketNumber === component.pocketCount ? 'front-pocket' : 't-pocket',
        selectedValue: [openingAccessor.opening(pocketNumber).id],
        onChange: (details: SelectValueChangeDetails<PocketOpeningSchema>): void => {
          const opening = details.items[0]
          if (isDefined(opening)) {
            handleMappingChange(pocketNumber, opening)
          }
        },
      }
    })
  }, [component, handleMappingChange])

  return (
    <SectionGroup.Section spaced={false}>
      <SectionGroup.SectionHeader>
        {t.project.editors.sections.components.pocketAssignments.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent padded={false}>
        <Grid templateColumns="max-content auto minmax(0, 1fr)" columnGap="4">
          {rows.map(({ pocketNumber, pocketType, selectedValue, onChange: handleChange }) => (
            <Grid
              key={pocketNumber}
              gridColumn="1 / -1"
              templateColumns="subgrid"
              alignItems="center"
              px="4"
              py="3"
              _notLast={{ borderBottomWidth: '1px' }}
            >
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
              <Flex align="center" justify="center" color="fg.muted">
                <PiArrowRight />
              </Flex>
              <Select.Root
                collection={collection}
                value={selectedValue}
                onValueChange={handleChange}
                positioning={{ strategy: 'fixed' }}
                size="xs"
                width="full"
                minW="0"
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText
                      placeholder={t.project.editors.sections.components.pocketAssignments.openingMapping.label}
                    />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {collection.items.map((opening) => (
                      <Select.Item key={opening.id} item={opening}>
                        {opening.name}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Grid>
          ))}
        </Grid>
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Section>
  )
}
