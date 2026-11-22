import { Box, Breadcrumb, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { Fragment, useCallback, useMemo, type FC, type ReactElement } from 'react'
import { PiLink, PiTrash } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import type { BindingFieldNameSchema, BindingFieldSchema, BindingSchema } from '../../schemas/bindings'
import { isDefined } from '../../utils/isDefined'
import { EditorIconButton } from '../common/EditorIconButton'
import { getBindingFieldLabel, getBindingModelPath } from './bindingFieldUtils'
import { getBindingFieldIcon } from './getBindingFieldIcon'

type BindingFieldListProps = {
  binding: BindingSchema
}

export const BindingFieldList: FC<BindingFieldListProps> = ({ binding }) => {
  const { accessor } = useSubProject()

  const groups = useMemo<Map<BindingFieldNameSchema, BindingFieldSchema[]>>(() => {
    const groups = new Map<BindingFieldNameSchema, BindingFieldSchema[]>()
    for (const field of binding.fields) {
      if (!isDefined(accessor.optional.binding.model(field))) {
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
  }, [binding.fields, accessor])

  return (
    <VStack align="stretch" gap="2">
      {Array.from(groups, ([name, fields]) => (
        <BindingFieldGroup key={name} bindingId={binding.id} name={name} fields={fields} />
      ))}
    </VStack>
  )
}

type BindingFieldGroupProps = {
  bindingId: string
  name: BindingFieldNameSchema
  fields: BindingFieldSchema[]
}

const BindingFieldGroup: FC<BindingFieldGroupProps> = ({ bindingId, name, fields }) => {
  const { t } = useTranslation()

  return (
    <VStack align="stretch" gap="2" flex="1" minW="0" borderWidth="1px" borderRadius="md" px="3" py="2">
      <HStack gap="1.5">
        <Icon as={getBindingFieldIcon(name)} size="sm" flexShrink="0" />
        <Text textStyle="sm" fontWeight="medium" truncate>
          {getBindingFieldLabel(name, t)}
        </Text>
      </HStack>
      <BindingLinkedList gap={1} iconSize={3} connectorWidth={3.5}>
        {fields.map((field) => (
          <BindingFieldBinding key={field.id} bindingId={bindingId} field={field} />
        ))}
      </BindingLinkedList>
    </VStack>
  )
}

type BindingFieldBindingProps = {
  bindingId: string
  field: BindingFieldSchema
}

const BindingFieldBinding: FC<BindingFieldBindingProps> = ({ bindingId, field }) => {
  const { subProject, accessor } = useSubProject()
  const { isComputing } = useEditorContext()
  const { deleteBindingField } = useSubProjectOperations()
  const model = accessor.optional.binding.model(field)
  const handleDelete = useCallback(() => {
    deleteBindingField({ bindingId, id: field.id })
  }, [bindingId, deleteBindingField, field.id])

  if (!isDefined(model)) {
    return null
  }
  const path = getBindingModelPath(model, subProject)

  return (
    <HStack gap="3" flex="1" minW="0" justify="space-between">
      <Breadcrumb.Root size="sm" color="fg.muted" minW="0" mt="1">
        <Breadcrumb.List flexWrap="wrap" gap="1" fontSize="2xs">
          {path.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <Breadcrumb.Separator />}
              <Breadcrumb.Item>
                <Text as="span">{item.name}</Text>
              </Breadcrumb.Item>
            </Fragment>
          ))}
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <EditorIconButton readOnly={isComputing} size="2xs" variant="ghost" flexShrink="0" onClick={handleDelete}>
        <PiTrash />
      </EditorIconButton>
    </HStack>
  )
}

type BindingLinkedListProps = {
  children: ReactElement[]
  gap: number
  iconSize: number
  connectorWidth: number
}

const BindingLinkedList: FC<BindingLinkedListProps> = ({ children, gap, iconSize, connectorWidth }) => {
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
