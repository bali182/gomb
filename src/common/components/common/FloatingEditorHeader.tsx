import { Box, HStack, Popover } from '@chakra-ui/react'
import type { FC, ReactElement, ReactNode } from 'react'
import { SubProjectComputationIcon } from '../SubProjectComputationFeedback'

type FloatingEditorHeaderProps = {
  icon: ReactNode
  menu: ReactElement
  rightAddon?: ReactNode
  title: ReactNode
}

export const FloatingEditorHeader: FC<FloatingEditorHeaderProps> = ({ icon, menu, rightAddon, title }) => (
  <Popover.Header p="0">
    <HStack justify="space-between" px="4" py="2" minW="0">
      <HStack gap="1.5" flex="1" minW="0">
        <SubProjectComputationIcon>
          <Box display="inline-flex" boxSize="4" fontSize="md" flexShrink="0">
            {icon}
          </Box>
        </SubProjectComputationIcon>
        <Box flex="1" minW="0">
          {title}
        </Box>
      </HStack>
      <HStack gap="2" flexShrink="0">
        {rightAddon}
        {menu}
      </HStack>
    </HStack>
  </Popover.Header>
)
