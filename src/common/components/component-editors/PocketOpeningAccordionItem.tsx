import { Accordion, Box, Button, HStack, Input, Menu, Portal, type MenuValueChangeDetails } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, type ChangeEvent, type FC } from 'react'
import { PiCaretDown, PiTrash } from 'react-icons/pi'

import { defaultRecessedPocketOpening, defaultSlantedPocketOpening } from '../../defaultStates'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { usePocketOpeningLimitIssues } from '../../hooks/usePocketOpeningLimitIssues'
import { useSubProject } from '../../hooks/useSubProject'
import { useTranslation } from '../../hooks/useTranslation'
import { getAdjustedPocketOpening } from '../../logic/getAdjustedPocketOpening'
import { portalRef } from '../../portalRef'
import type { HasIdentitySchema } from '../../schemas/common'
import type { PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { accessors } from '../../utils/accessors'
import { getEditableSchema } from '../../utils/getEditableSchema'
import { isDefined } from '../../utils/isDefined'
import { PocketOpeningPreview } from '../common/PocketOpeningPreview'
import { TooltipIcon } from '../common/TooltipIcon'
import { PocketOpeningFields } from './sections/PocketOpeningFields'

type PocketOpeningAccordionItemProps = {
  pocketCluster: PocketClusterSchema
  opening: PocketOpeningSchema
  editable: EditableSchema<PocketOpeningSchema>
  issues: IssuesSchema<PocketOpeningSchema>
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
  onClose: (id: string) => void
  onDelete?: () => void
}

const openingTypes: PocketOpeningSchema['type'][] = ['straight', 'recessed', 'slanted']

export const PocketOpeningAccordionItem: FC<PocketOpeningAccordionItemProps> = ({
  pocketCluster,
  opening,
  editable,
  issues: incomingIssues,
  onChange,
  onClose,
  onDelete,
}) => {
  const limitIssues = usePocketOpeningLimitIssues(pocketCluster, opening)
  const issues = useCombinedIssues<PocketOpeningSchema>(incomingIssues, limitIssues)

  const { t, language } = useTranslation()
  const computed = useComputedComponent<ComputedPocketClusterSchema>(pocketCluster.id)
  const { computedSubProject } = useSubProject()
  const limits = accessors.subProjectLimits(computedSubProject.limits).optional.opening(pocketCluster.id, opening.id)
  const adjustedOpening = useMemo<PocketOpeningSchema>(() => {
    if (!isDefined(limits) || limits.type !== opening.type) {
      return opening
    }
    return getAdjustedPocketOpening(opening, limits)
  }, [opening, limits])
  const pocketRect = computed.frontPocket.boundingRect
  const orientation = pocketCluster.orientation
  const isDefault = opening.id === pocketCluster.defaultOpening.id
  const isTriggerDisabled = editable.type === 'straight'
  const hasNameError = issues.name?.severity === 'error'

  useEffect(() => {
    if (isTriggerDisabled) {
      onClose(editable.id)
    }
  }, [editable.id, isTriggerDisabled, onClose])

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onChange({ ...editable, name: event.currentTarget.value })
    },
    [editable, onChange],
  )

  const handleTypeChange = useCallback(
    (details: MenuValueChangeDetails): void => {
      const identity: HasIdentitySchema = { id: editable.id, name: editable.name }
      switch (details.value) {
        case 'straight':
          onChange({ ...identity, type: 'straight' })
          break
        case 'recessed':
          onChange({ ...getEditableSchema(defaultRecessedPocketOpening, { language }), ...identity })
          break
        case 'slanted':
          onChange({ ...getEditableSchema(defaultSlantedPocketOpening, { language }), ...identity })
          break
      }
    },
    [editable.id, editable.name, language, onChange],
  )

  return (
    <Accordion.Item value={editable.id}>
      <Box position="relative" bg="bg.muted">
        <Accordion.ItemTrigger
          position="absolute"
          inset="0"
          width="full"
          height="full"
          p="0"
          borderRadius="0"
          disabled={isTriggerDisabled}
          cursor="pointer"
          _disabled={{ cursor: 'default' }}
        />
        <HStack position="relative" pointerEvents="none" px="3" py="2" gap="3">
          <Accordion.ItemIndicator color={isTriggerDisabled ? 'fg.subtle' : 'fg'} opacity={isTriggerDisabled ? 0.5 : 1}>
            <PiCaretDown />
          </Accordion.ItemIndicator>
          <PocketOpeningPreview
            adjustedOpening={adjustedOpening}
            pocketRect={pocketRect}
            pocketCluster={pocketCluster}
            cornerRadius={computed.frontPocket.cornerRadius}
            width={60}
            height={30}
          />
          <HStack flex="1" minW="0" gap="1">
            <Input
              aria-invalid={hasNameError}
              fieldSizing="content"
              fontWeight="medium"
              onChange={handleNameChange}
              pointerEvents="auto"
              size="xs"
              value={editable.name}
              maxW="full"
              w="auto"
              bg="bg"
              placeholder=""
            />
            {isDefined(issues.name) && <TooltipIcon content={issues.name.message} severity={issues.name.severity} />}
          </HStack>
          <Menu.Root size="sm" positioning={{ sameWidth: false }}>
            <Menu.Trigger asChild>
              <Button
                size="xs"
                variant="ghost"
                flexShrink="0"
                pointerEvents="auto"
                _hover={{ bg: 'bg.emphasized' }}
                _expanded={{ bg: 'bg.emphasized' }}
              >
                {t.project.editors.enums.components.pocketOpening[editable.type]}
                <PiCaretDown />
              </Button>
            </Menu.Trigger>
            <Portal container={portalRef}>
              <Menu.Positioner>
                <Menu.Content width="max-content" pointerEvents="auto">
                  <Menu.RadioItemGroup value={editable.type} onValueChange={handleTypeChange}>
                    {openingTypes.map((type) => (
                      <Menu.RadioItem key={type} value={type} whiteSpace="nowrap">
                        <Menu.ItemText>{t.project.editors.enums.components.pocketOpening[type]}</Menu.ItemText>
                        <Menu.ItemIndicator />
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
          <Box flexShrink="0" pointerEvents="auto">
            <Button size="xs" colorPalette="red" variant="ghost" disabled={isDefault} onClick={onDelete}>
              <PiTrash /> {t.project.editors.actions.pocketOpenings.delete}
            </Button>
          </Box>
        </HStack>
      </Box>
      <Accordion.ItemContent>
        <Accordion.ItemBody px="0" pt="3" pb="0">
          <PocketOpeningFields editable={editable} issues={issues} orientation={orientation} onChange={onChange} />
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  )
}
