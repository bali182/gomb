import { Box } from '@chakra-ui/react'
import type { FC, ReactNode } from 'react'
import type { IconType } from 'react-icons'

type TreeItemVisualProps = {
  icon: IconType
  trigger?: ReactNode
  label: ReactNode
  leading: ReactNode
  trailing: ReactNode
  isPositioned: boolean
}

export const TreeItemVisual: FC<TreeItemVisualProps> = ({
  icon: Icon,
  trigger,
  label,
  leading,
  trailing,
  isPositioned,
}) => (
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
    <Icon />
    {label}
    {trailing}
  </Box>
)
