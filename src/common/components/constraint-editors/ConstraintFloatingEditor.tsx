import { Box, Text, VStack } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiLinkDuotone } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import type { ConstraintSchema } from '../../schemas/constraints'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { ConstraintActionsMenu } from '../action-menus/ConstraintActionsMenu'
import { CommonEmptyState } from '../common/CommonEmptyState'
import { FloatingEditor } from '../common/FloatingEditor'
import { FloatingEditorHeader } from '../common/FloatingEditorHeader'
import { ConstraintFieldCombobox } from './ConstraintFieldCombobox'
import { ConstraintFieldList } from './ConstraintFieldList'
import { getConstraintLabel } from './constraintFieldUtils'

type ConstraintFloatingEditorProps = {
  constraint: ConstraintSchema
  anchorElement: FloatingEditorAnchor
  onClose: () => void
}
export const ConstraintFloatingEditor: FC<ConstraintFloatingEditorProps> = ({ constraint, anchorElement, onClose }) => {
  const { t } = useTranslation()
  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose} positioning="to-tree" maxHeight="80dvh">
      <FloatingEditorHeader
        icon={<PiLinkDuotone />}
        menu={<ConstraintActionsMenu constraint={constraint} size="xs" onDelete={onClose} />}
        title={
          <Text fontWeight="bold" textStyle="sm" truncate>
            {getConstraintLabel(constraint, t)}
          </Text>
        }
      />
      <VStack align="stretch" gap="3" p="4" minH="0" overflow="hidden">
        <Box minH="0" overflowY="auto">
          {constraint.fields.length === 0 ? (
            <CommonEmptyState
              icon={<PiLinkDuotone />}
              title={t.project.editors.emptyStates.noConstraintFields.title}
              description={t.project.editors.emptyStates.noConstraintFields.description}
            />
          ) : (
            <ConstraintFieldList constraint={constraint} />
          )}
        </Box>
        <Box flexShrink="0">
          <ConstraintFieldCombobox key={constraint.id} constraint={constraint} />
        </Box>
      </VStack>
    </FloatingEditor>
  )
}
