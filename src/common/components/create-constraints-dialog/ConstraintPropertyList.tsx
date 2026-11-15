import { Checkbox, Icon, Text, VStack } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import type {
  CommonConstraintProperty,
  ConstraintPropertyBlocker,
} from '../../logic/constraints/constraintCreationUtils'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import { isDefined } from '../../utils/isDefined'
import { getConstraintFieldIcon } from '../constraint-editors/constraintFieldIcons'
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
  const constrainedModelNames = useMemo<string[]>(
    () => property.blockers.filter((blocker) => blocker.alreadyConstrained).map((blocker) => blocker.model.name),
    [property.blockers],
  )
  const automaticBlockers = useMemo<ConstraintPropertyBlocker[]>(
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
          <Icon as={getConstraintFieldIcon(property.field)} size="sm" flexShrink="0" />
          {getConstraintFieldLabel(property.field, t)}
        </Checkbox.Label>
        {constrainedModelNames.length > 0 && (
          <Text textStyle="xs" color="fg.muted">
            {t.dialogs.createConstraints.alreadyConstrained}{' '}
            {t.dialogs.createConstraints.affectedModels(constrainedModelNames.join(', '))}
          </Text>
        )}
        {isDefined(autoReason) && (
          <Text textStyle="xs" color="fg.muted">
            {t.project.editors.enums.constraints.blockReason[autoReason]}{' '}
            {t.dialogs.createConstraints.affectedModels(automaticModelNames.join(', '))}
          </Text>
        )}
      </VStack>
      <Checkbox.Control flexShrink="0">
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Root>
  )
}
