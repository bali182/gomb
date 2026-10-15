import { Accordion, Box, Button, Text } from '@chakra-ui/react'
import type BigNumber from 'bignumber.js'
import { useMemo, type FC } from 'react'
import { PiCaretDown, PiTrash } from 'react-icons/pi'

import { ZERO } from '../../constants/layout'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { useTranslation } from '../../hooks/useTranslation'
import { getAdjustedPocketOpening } from '../../logic/getAdjustedPocketOpening'
import { getMaximumOpeningCornerRadius } from '../../logic/pocketUtils'
import type { PocketClusterSchema, PocketOpeningOwnSchema, PocketOpeningSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { accessors } from '../../utils/accessors'
import { PocketOpeningPreview } from '../common/PocketOpeningPreview'
import { PocketOpeningFields } from './sections/PocketOpeningFields'

type PocketOpeningAccordionItemProps = {
  pocketCluster: PocketClusterSchema
  opening: PocketOpeningSchema
  editable: EditableSchema<PocketOpeningSchema>
  issues: ValidationIssuesSchema<PocketOpeningSchema>
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
  onDelete?: () => void
}

export const PocketOpeningAccordionItem: FC<PocketOpeningAccordionItemProps> = ({
  pocketCluster,
  opening,
  editable,
  issues,
  onChange,
  onDelete,
}) => {
  const { t } = useTranslation()
  const computed = useComputedComponent<ComputedPocketClusterSchema>(pocketCluster.id)
  const pocketRect = computed.frontPocket.boundingRect
  const orientation = pocketCluster.orientation
  const isDefault = opening.id === pocketCluster.defaultOpening.id

  const openingCornerRadius = useMemo<BigNumber>(
    () => (computed.tPockets.length > 0 ? getMaximumOpeningCornerRadius(computed.cornerRadius, orientation) : ZERO),
    [computed.cornerRadius, computed.tPockets.length, orientation],
  )

  const assignedPockets = useMemo<number[]>(() => {
    const openingAccessor = accessors.pocketCluster(pocketCluster)
    return Array.from({ length: pocketCluster.pocketCount }, (_, index) => index + 1).filter(
      (number) => openingAccessor.opening(number).id === opening.id,
    )
  }, [pocketCluster, opening.id])

  const adjustedOpening = useMemo<PocketOpeningOwnSchema>(
    () => getAdjustedPocketOpening(opening, pocketRect, orientation, openingCornerRadius),
    [openingCornerRadius, orientation, pocketRect, opening],
  )

  return (
    <Accordion.Item value={editable.id}>
      <Box position="relative" bg="bg.muted">
        <Accordion.ItemTrigger px="3" pr="20" py="3" borderRadius="0">
          <Accordion.ItemIndicator>
            <PiCaretDown />
          </Accordion.ItemIndicator>
          <PocketOpeningPreview
            adjustedOpening={adjustedOpening}
            pocketRect={pocketRect}
            orientation={orientation}
            width={60}
            height={30}
          />
          <Box as="span" flex="1" minW="0">
            <Text as="span" overflowWrap="anywhere">
              {opening.name}
            </Text>
            <Text as="span" display="block" color="fg.muted" textStyle="xs" fontWeight="normal">
              {assignedPockets.length > 0
                ? t.project.editors.controls.pocketOpenings.assignedPockets(assignedPockets)
                : t.project.editors.controls.pocketOpenings.unassigned}
            </Text>
          </Box>
        </Accordion.ItemTrigger>
        <Button
          position="absolute"
          right="2"
          top="50%"
          transform="translateY(-50%)"
          zIndex="1"
          size="xs"
          colorPalette="red"
          // variant={isDefault ? 'subtle' : 'surface'}
          variant="ghost"
          disabled={isDefault}
          onClick={onDelete}
        >
          <PiTrash /> {t.project.editors.actions.pocketOpenings.delete}
        </Button>
      </Box>
      <Accordion.ItemContent>
        <Accordion.ItemBody px="0" pt="3" pb="0">
          <PocketOpeningFields editable={editable} issues={issues} onChange={onChange} />
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  )
}
