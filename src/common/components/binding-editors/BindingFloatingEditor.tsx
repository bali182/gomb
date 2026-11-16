import { Box, Text, VStack } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiLink } from 'react-icons/pi'
import { useTranslation } from '../../hooks/useTranslation'
import type { BindingSchema } from '../../schemas/bindings'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { BindingActionsMenu } from '../action-menus/BindingActionsMenu'
import { CommonEmptyState } from '../common/CommonEmptyState'
import { FloatingEditor } from '../common/FloatingEditor'
import { FloatingEditorHeader } from '../common/FloatingEditorHeader'
import { BindingFieldAdder } from './BindingFieldAdder'
import { BindingFieldList } from './BindingFieldList'
import { getBindingLabel } from './bindingFieldUtils'

type BindingFloatingEditorProps = {
  binding: BindingSchema
  anchorElement: FloatingEditorAnchor
  onClose: () => void
}
export const BindingFloatingEditor: FC<BindingFloatingEditorProps> = ({ binding, anchorElement, onClose }) => {
  const { t } = useTranslation()
  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose} positioning="to-tree" maxHeight="80dvh">
      <FloatingEditorHeader
        icon={<PiLink />}
        menu={<BindingActionsMenu binding={binding} size="xs" onDelete={onClose} />}
        title={
          <Text fontWeight="bold" textStyle="sm" truncate>
            {getBindingLabel(binding, t)}
          </Text>
        }
      />
      <VStack align="stretch" gap="3" p="4" minH="0" overflow="hidden">
        <Box minH="0" overflowY="auto">
          {binding.fields.length === 0 ? (
            <CommonEmptyState
              icon={<PiLink />}
              title={t.project.editors.emptyStates.noBindingFields.title}
              description={t.project.editors.emptyStates.noBindingFields.description}
            />
          ) : (
            <BindingFieldList binding={binding} />
          )}
        </Box>
        <Box flexShrink="0">
          <BindingFieldAdder key={binding.id} binding={binding} />
        </Box>
      </VStack>
    </FloatingEditor>
  )
}
