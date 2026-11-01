import { Box, HStack, Popover } from '@chakra-ui/react'
import { useCallback, type ChangeEvent, type ReactElement, type ReactNode } from 'react'
import { EditorTextInput } from './EditorTextInput'

import type { HasIdentitySchema } from '../../schemas/common'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { SubProjectComputationIcon } from '../SubProjectComputationFeedback'

type IdentityFloatingEditorHeaderProps<T> = {
  editable: EditableSchema<T>
  icon: ReactNode
  issues: IssuesSchema<T>
  menu: ReactElement
  onChange: (updated: EditableSchema<T>) => void
  rightAddon?: ReactNode
}

export function IdentityFloatingEditorHeader<T extends HasIdentitySchema>({
  editable,
  icon,
  issues,
  menu,
  onChange,
  rightAddon,
}: IdentityFloatingEditorHeaderProps<T>): ReactElement {
  const hasNameError = isDefined(issues.name) && issues.name.severity === 'error'

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onChange({ ...editable, name: event.currentTarget.value })
    },
    [editable, onChange],
  )

  return (
    <Popover.Header p="0">
      <HStack justify="space-between" px="4" py="2">
        <HStack gap="1.5">
          <SubProjectComputationIcon>
            <Box display="inline-flex" boxSize="4" fontSize="md" flexShrink="0">
              {icon}
            </Box>
          </SubProjectComputationIcon>
          <EditorTextInput
            modelId={editable.id}
            field="name"
            aria-invalid={hasNameError}
            _invalid={{ borderColor: 'border.error', focusRingColor: 'border.error' }}
            borderColor="transparent"
            fieldSizing="content"
            focusRing="inside"
            focusRingColor="colorPalette.focusRing"
            fontWeight="bold"
            onChange={handleNameChange}
            px="1"
            size="sm"
            value={editable.name}
            w="auto"
            autoFocus
          />
        </HStack>
        <HStack gap="2">
          {rightAddon}
          {menu}
        </HStack>
      </HStack>
    </Popover.Header>
  )
}
