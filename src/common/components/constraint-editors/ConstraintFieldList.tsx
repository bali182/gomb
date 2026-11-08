import { Box, Breadcrumb, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { Fragment, useCallback, useMemo, type FC, type ReactElement } from 'react'
import { PiLink, PiSlidersHorizontal, PiTrash } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import type { ConstraintFieldNameSchema, ConstraintFieldSchema, ConstraintSchema } from '../../schemas/constraints'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { EditorIconButton } from '../common/EditorIconButton'
import { getConstraintFieldLabel, getConstraintLabel, getConstraintModelPath } from './constraintFieldUtils'

type ConstraintFieldListProps = {
  constraint: ConstraintSchema
}

export const ConstraintFieldList: FC<ConstraintFieldListProps> = ({ constraint }) => {
  const { subProject } = useSubProject()

  const groups = useMemo<Map<ConstraintFieldNameSchema, ConstraintFieldSchema[]>>(() => {
    const accessor = accessors.subProject(subProject)
    const groups = new Map<ConstraintFieldNameSchema, ConstraintFieldSchema[]>()
    for (const field of constraint.fields) {
      if (!isDefined(accessor.optional.constraint.model(field))) {
        continue
      }
      const group = groups.get(field.field)
      if (isDefined(group)) {
        group.push(field)
      } else {
        groups.set(field.field, [field])
      }
    }
    return groups
  }, [constraint.fields, subProject])

  return (
    <VStack align="stretch" gap="2">
      {Array.from(groups, ([name, fields]) => (
        <ConstraintFieldGroup key={name} constraintId={constraint.id} name={name} fields={fields} />
      ))}
    </VStack>
  )
}

type ConstraintFieldGroupProps = {
  constraintId: string
  name: ConstraintFieldNameSchema
  fields: ConstraintFieldSchema[]
}

const ConstraintFieldGroup: FC<ConstraintFieldGroupProps> = ({ constraintId, name, fields }) => {
  const { t } = useTranslation()

  return (
    <VStack align="stretch" gap="2" flex="1" minW="0" borderWidth="1px" borderRadius="md" px="3" py="2">
      <HStack gap="1.5">
        <Icon as={PiSlidersHorizontal} boxSize="3.5" flexShrink="0" />
        <Text textStyle="sm" fontWeight="medium" truncate>
          {getConstraintFieldLabel(name, t)}
        </Text>
      </HStack>
      <ConstraintLinkedList gap={1} iconSize={3} connectorWidth={3.5}>
        {fields.map((field) => (
          <ConstraintFieldBinding key={field.id} constraintId={constraintId} field={field} />
        ))}
      </ConstraintLinkedList>
    </VStack>
  )
}

type ConstraintFieldBindingProps = {
  constraintId: string
  field: ConstraintFieldSchema
}

const ConstraintFieldBinding: FC<ConstraintFieldBindingProps> = ({ constraintId, field }) => {
  const { subProject } = useSubProject()
  const { isComputing } = useEditorContext()
  const { deleteConstraintField } = useSubProjectOperations()
  const { t } = useTranslation()
  const accessor = accessors.subProject(subProject)
  const model = accessor.optional.constraint.model(field)
  const handleDelete = useCallback(() => {
    deleteConstraintField({ constraintId, id: field.id })
  }, [constraintId, deleteConstraintField, field.id])

  if (!isDefined(model)) {
    return null
  }
  const path = getConstraintModelPath(model, subProject)

  return (
    <HStack gap="3" flex="1" minW="0" justify="space-between">
      <Breadcrumb.Root size="sm" color="fg.muted" minW="0">
        <Breadcrumb.List flexWrap="wrap" gap="1" fontSize="2xs">
          {path.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <Breadcrumb.Separator />}
              <Breadcrumb.Item>
                <Text as="span">{narrowers.is.constraint(item) ? getConstraintLabel(item, t) : item.name}</Text>
              </Breadcrumb.Item>
            </Fragment>
          ))}
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <EditorIconButton readOnly={isComputing} size="xs" variant="ghost" flexShrink="0" onClick={handleDelete}>
        <PiTrash />
      </EditorIconButton>
    </HStack>
  )
}

type ConstraintLinkedListProps = {
  children: ReactElement[]
  gap: number
  iconSize: number
  connectorWidth: number
}

const ConstraintLinkedList: FC<ConstraintLinkedListProps> = ({ children, gap, iconSize, connectorWidth }) => {
  const linked = children.length > 1

  return (
    <VStack position="relative" align="stretch" gap="0">
      {children.map((child, index) => (
        <HStack key={child.key} align="stretch" gap="1.5">
          {linked && (
            <Box position="relative" width={connectorWidth} flexShrink="0" color="fg.muted">
              {index > 0 && (
                <Box
                  position="absolute"
                  left="0"
                  right="0"
                  top="0"
                  bottom="50%"
                  borderLeftWidth="1px"
                  borderBottomWidth="1px"
                  borderColor="currentColor"
                  borderBottomLeftRadius={index === children.length - 1 ? 'lg' : '0'}
                />
              )}
              {index < children.length - 1 && (
                <Box
                  position="absolute"
                  left="0"
                  right="0"
                  top="50%"
                  bottom="0"
                  borderLeftWidth="1px"
                  borderTopWidth={index === 0 ? '1px' : '0'}
                  borderColor="currentColor"
                  borderTopLeftRadius={index === 0 ? 'lg' : '0'}
                />
              )}
            </Box>
          )}
          <Box flex="1" minW="0" py={linked ? gap / 2 : 0}>
            {child}
          </Box>
        </HStack>
      ))}
      {linked && (
        <Box
          position="absolute"
          left="0"
          top="50%"
          translate="-50% -50%"
          display="flex"
          pointerEvents="none"
          color="fg.muted"
        >
          <Box display="flex" flexShrink="0" p="0.5" bg="bg.panel">
            <Icon as={PiLink} boxSize={iconSize} />
          </Box>
        </Box>
      )}
    </VStack>
  )
}
