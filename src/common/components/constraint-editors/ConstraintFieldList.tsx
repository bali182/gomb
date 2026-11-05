import { Breadcrumb, HStack, Text, VStack } from '@chakra-ui/react'
import { Fragment, type FC } from 'react'
import { PiTrash } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import type { ConstraintSchema } from '../../schemas/constraints'
import { accessors } from '../../utils/accessors'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { EditorIconButton } from '../common/EditorIconButton'
import { getConstraintFieldLabel, getConstraintLabel, getConstraintModelPath } from './constraintFieldUtils'

type ConstraintFieldListProps = {
  constraint: ConstraintSchema
}

export const ConstraintFieldList: FC<ConstraintFieldListProps> = ({ constraint }) => {
  const { subProject } = useSubProject()
  const { isComputing } = useEditorContext()
  const { deleteConstraintField } = useSubProjectOperations()
  const { t } = useTranslation()
  const accessor = accessors.subProject(subProject)
  return (
    <VStack align="stretch" gap="2">
      {constraint.fields.map((field) => {
        const model = accessor.optional.constraint.model(field)
        if (!isDefined(model)) {
          return null
        }
        const Icon = getModelIcon(model, subProject)
        const path = getConstraintModelPath(model, subProject)
        return (
          <HStack key={field.id} gap="3" borderWidth="1px" borderRadius="md" px="3" py="2">
            <Icon />
            <VStack align="stretch" gap="1" flex="1" minW="0">
              <Text textStyle="sm" fontWeight="medium" truncate>
                {getConstraintFieldLabel(field.field, t)}
              </Text>
              <Breadcrumb.Root size="sm" color="fg.muted">
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
            </VStack>
            <EditorIconButton
              readOnly={isComputing}
              size="xs"
              variant="ghost"
              onClick={() => deleteConstraintField(constraint.id, field.id)}
            >
              <PiTrash />
            </EditorIconButton>
          </HStack>
        )
      })}
    </VStack>
  )
}
