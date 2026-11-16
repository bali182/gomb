import { Checkbox, Icon, Text, VStack } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { BindingPropertyBlocker, CommonBindingProperty } from '../../logic/bindings/bindingCreationUtils'
import type { BindingFieldNameSchema } from '../../schemas/bindings'
import { isDefined } from '../../utils/isDefined'
import { getBindingFieldLabel } from '../binding-editors/bindingFieldUtils'
import { getBindingFieldIcon } from '../binding-editors/getBindingFieldIcon'

type BindingPropertyListProps = {
  properties: CommonBindingProperty[]
  selection: BindingFieldNameSchema[]
  onSelectionChange: (field: BindingFieldNameSchema, selected: boolean) => void
}

export const BindingPropertyList: FC<BindingPropertyListProps> = ({ properties, selection, onSelectionChange }) => {
  const { t } = useTranslation()
  return (
    <VStack align="stretch" gap="3">
      <Text fontWeight="semibold">{t.dialogs.createBindings.commonProperties}</Text>
      {properties.map((property) => (
        <BindingPropertyItem
          key={property.field}
          property={property}
          selected={selection.includes(property.field)}
          onSelectionChange={onSelectionChange}
        />
      ))}
    </VStack>
  )
}

type BindingPropertyItemProps = {
  property: CommonBindingProperty
  selected: boolean
  onSelectionChange: (field: BindingFieldNameSchema, selected: boolean) => void
}

const BindingPropertyItem: FC<BindingPropertyItemProps> = ({ property, selected, onSelectionChange }) => {
  const { t } = useTranslation()
  const disabled = property.blockers.length > 0
  const boundModelNames = useMemo<string[]>(
    () => property.blockers.filter((blocker) => blocker.alreadyBound).map((blocker) => blocker.model.name),
    [property.blockers],
  )
  const automaticBlockers = useMemo<BindingPropertyBlocker[]>(
    () => property.blockers.filter((blocker) => isDefined(blocker.autoReason)),
    [property.blockers],
  )
  const automaticModelNames = useMemo<string[]>(
    () => automaticBlockers.map((blocker) => blocker.model.name),
    [automaticBlockers],
  )
  const autoReason = automaticBlockers[0]?.autoReason
  const handleCheckedChange = useCallback(
    (details: Checkbox.CheckedChangeDetails): void => {
      onSelectionChange(property.field, details.checked === true)
    },
    [onSelectionChange, property.field],
  )
  return (
    <Checkbox.Root
      checked={selected}
      disabled={disabled}
      onCheckedChange={handleCheckedChange}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderWidth="1px"
      borderRadius="md"
      px="4"
      py="3"
      gap="4"
      cursor="pointer"
      _hover={{ bg: 'bg.muted' }}
      _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
    >
      <Checkbox.HiddenInput />
      <VStack align="stretch" gap="1" flex="1" minW="0">
        <Checkbox.Label display="flex" alignItems="center" gap="2">
          <Icon as={getBindingFieldIcon(property.field)} size="sm" flexShrink="0" />
          {getBindingFieldLabel(property.field, t)}
        </Checkbox.Label>
        {boundModelNames.length > 0 && (
          <Text textStyle="xs" color="fg.muted">
            {t.dialogs.createBindings.alreadyBound}{' '}
            {t.dialogs.createBindings.affectedModels(boundModelNames.join(', '))}
          </Text>
        )}
        {isDefined(autoReason) && (
          <Text textStyle="xs" color="fg.muted">
            {t.project.editors.enums.bindings.blockReason[autoReason]}{' '}
            {t.dialogs.createBindings.affectedModels(automaticModelNames.join(', '))}
          </Text>
        )}
      </VStack>
      <Checkbox.Control flexShrink="0">
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Root>
  )
}
