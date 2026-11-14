import { Checkbox, Text, VStack } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type { CommonConstraintProperty } from '../../logic/constraints/constraintCreationUtils'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getConstraintFieldLabel } from '../constraint-editors/constraintFieldUtils'

type ConstraintPropertyListProps = {
  properties: CommonConstraintProperty[]
  selection: ConstraintFieldNameSchema[]
  onSelectionChange: (field: ConstraintFieldNameSchema, selected: boolean) => void
}

export const ConstraintPropertyList: FC<ConstraintPropertyListProps> = ({
  properties,
  selection,
  onSelectionChange,
}) => {
  const { t } = useTranslation()
  return (
    <VStack align="stretch" gap="3">
      <Text fontWeight="semibold">{t.dialogs.createConstraints.commonProperties}</Text>
      {properties.map((property) => (
        <ConstraintPropertyItem
          key={property.field}
          property={property}
          selected={selection.includes(property.field)}
          onSelectionChange={onSelectionChange}
        />
      ))}
    </VStack>
  )
}

type ConstraintPropertyItemProps = {
  property: CommonConstraintProperty
  selected: boolean
  onSelectionChange: (field: ConstraintFieldNameSchema, selected: boolean) => void
}

const ConstraintPropertyItem: FC<ConstraintPropertyItemProps> = ({ property, selected, onSelectionChange }) => {
  const { t } = useTranslation()
  const disabled = property.blockers.length > 0
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
        <Checkbox.Label>{getConstraintFieldLabel(property.field, t)}</Checkbox.Label>
        {property.blockers.map((blocker) => (
          <VStack key={blocker.model.id} align="stretch" gap="1">
            {blocker.alreadyConstrained && (
              <Text textStyle="xs" color="fg.muted">
                {narrowers.is.constraint(blocker.model) ? '' : blocker.model.name}:{' '}
                {t.dialogs.createConstraints.alreadyConstrained}
              </Text>
            )}
            {isDefined(blocker.autoReason) && (
              <Text textStyle="xs" color="fg.muted">
                {narrowers.is.constraint(blocker.model) ? '' : blocker.model.name}:{' '}
                {t.project.editors.enums.constraints.blockReason[blocker.autoReason]}
              </Text>
            )}
          </VStack>
        ))}
      </VStack>
      <Checkbox.Control flexShrink="0">
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Root>
  )
}
