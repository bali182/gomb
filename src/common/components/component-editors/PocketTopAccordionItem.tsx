import { Accordion, Badge, Box, Button, HStack, Text } from '@chakra-ui/react'
import type BigNumber from 'bignumber.js'
import { useMemo, type FC } from 'react'
import { PiCaretDown } from 'react-icons/pi'

import { ZERO } from '../../constants/layout'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { useTranslation } from '../../hooks/useTranslation'
import { getAdjustedPocketTop } from '../../logic/getAdjustedPocketTop'
import { getMaximumOpeningCornerRadius } from '../../logic/pocketUtils'
import type { PocketClusterSchema, PocketTopOwnSchema, PocketTopSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { PocketTopPreview } from '../common/PocketTopPreview'
import { PocketTopFields } from './sections/PocketTopFields'

type PocketTopAccordionItemProps = {
  pocketCluster: PocketClusterSchema
  pocketTop: PocketTopSchema
  editable: EditableSchema<PocketTopSchema>
  issues: ValidationIssuesSchema<PocketTopSchema>
  onChange: (updated: EditableSchema<PocketTopSchema>) => void
  onDelete?: () => void
}

export const PocketTopAccordionItem: FC<PocketTopAccordionItemProps> = ({
  pocketCluster,
  pocketTop,
  editable,
  issues,
  onChange,
  onDelete,
}) => {
  const { t } = useTranslation()
  const computed = useComputedComponent<ComputedPocketClusterSchema>(pocketCluster.id)
  const pocketRect = computed.frontPocket.boundingRect
  const orientation = pocketCluster.orientation
  const isDefault = pocketTop.id === pocketCluster.defaultPocketTop.id

  const openingCornerRadius = useMemo<BigNumber>(
    () => (computed.tPockets.length > 0 ? getMaximumOpeningCornerRadius(computed.cornerRadius, orientation) : ZERO),
    [computed.cornerRadius, computed.tPockets.length, orientation],
  )

  const assignedPockets = useMemo<number[]>(() => {
    const pocketTopAccessor = accessors.pocketCluster(pocketCluster)
    return Array.from({ length: pocketCluster.pocketCount }, (_, index) => index + 1).filter(
      (number) => pocketTopAccessor.pocketTop(number).id === pocketTop.id,
    )
  }, [pocketCluster, pocketTop.id])

  const adjustedPocketTop = useMemo<PocketTopOwnSchema>(
    () => getAdjustedPocketTop(pocketTop, pocketRect, orientation, openingCornerRadius),
    [openingCornerRadius, orientation, pocketRect, pocketTop],
  )

  return (
    <Accordion.Item value={editable.id}>
      <Box position="relative" bg="bg.muted">
        <Accordion.ItemTrigger px="3" pr={isDefined(onDelete) ? '20' : '3'} py="3" borderRadius="0">
          <Accordion.ItemIndicator>
            <PiCaretDown />
          </Accordion.ItemIndicator>
          <PocketTopPreview
            adjustedPocketTop={adjustedPocketTop}
            pocketRect={pocketRect}
            orientation={orientation}
            width={60}
            height={30}
          />
          <Box as="span" flex="1" minW="0">
            <HStack as="span" gap="2" flexWrap="wrap">
              <Text as="span" overflowWrap="anywhere">
                {pocketTop.name}
              </Text>
              {isDefault && <Badge>{t.project.editors.controls.pocketTops.default}</Badge>}
            </HStack>
            <Text as="span" display="block" color="fg.muted" textStyle="xs" fontWeight="normal">
              {assignedPockets.length > 0
                ? t.project.editors.controls.pocketTops.assignedPockets(assignedPockets)
                : t.project.editors.controls.pocketTops.unassigned}
            </Text>
          </Box>
        </Accordion.ItemTrigger>
        {isDefined(onDelete) && (
          <Button
            position="absolute"
            right="2"
            top="50%"
            transform="translateY(-50%)"
            zIndex="1"
            size="xs"
            onClick={onDelete}
          >
            {t.project.editors.actions.pocketTops.delete}
          </Button>
        )}
      </Box>
      <Accordion.ItemContent>
        <Accordion.ItemBody px="0" pt="3" pb="0">
          <PocketTopFields editable={editable} issues={issues} onChange={onChange} />
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  )
}
