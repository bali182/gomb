import { Box, Text, type TextProps } from '@chakra-ui/react'
import type { FC, ReactNode } from 'react'

type TreeItemVisualProps = {
  icon: ReactNode
  trigger?: ReactNode
  label: ReactNode
  leading: ReactNode
  trailing: ReactNode
  isPositioned: boolean
}

export const TreeItemVisual: FC<TreeItemVisualProps> = ({ icon, trigger, label, leading, trailing, isPositioned }) => (
  <Box
    alignItems="center"
    display="flex"
    flex="1"
    gap="2"
    height="100%"
    minW="0"
    position={isPositioned ? 'relative' : undefined}
    py="0"
    zIndex={isPositioned ? '1' : undefined}
  >
    {trigger}
    {leading}
    <Box display="inline-flex" boxSize="4" fontSize="md" flexShrink="0">
      {icon}
    </Box>
    {label}
    <Box flexShrink="0">{trailing}</Box>
  </Box>
)

export const TreeItemLabel: FC<TextProps> = (props) => <Text {...props} flex="1" minW="0" truncate />
