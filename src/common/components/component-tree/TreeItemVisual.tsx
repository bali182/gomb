import { Box, TreeView } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent, type ReactNode } from 'react'
import type { IconType } from 'react-icons'

import { PiCaretRight } from 'react-icons/pi'

type TreeItemVisualProps = {
  icon: IconType
  isBranch: boolean
  isExpandable: boolean
  isPositioned: boolean
  label: string
  leading: ReactNode
  trailing: ReactNode
}

export const TreeItemVisual: FC<TreeItemVisualProps> = ({
  icon: Icon,
  isBranch,
  isExpandable,
  isPositioned,
  label,
  leading,
  trailing,
}) => {
  const handleDisabledBranchTriggerClickCapture = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
  }, [])

  const branchTrigger = isBranch ? (
    <TreeView.BranchTrigger
      alignSelf="stretch"
      aria-disabled={!isExpandable}
      cursor={isExpandable ? undefined : 'not-allowed'}
      flexShrink="0"
      mx="-2"
      onClickCapture={!isExpandable ? handleDisabledBranchTriggerClickCapture : undefined}
      opacity={isExpandable ? undefined : 0.4}
      px="2"
    >
      <TreeView.BranchIndicator asChild transition="transform 200ms">
        <PiCaretRight />
      </TreeView.BranchIndicator>
    </TreeView.BranchTrigger>
  ) : null

  const text = isBranch ? (
    <TreeView.BranchText>{label}</TreeView.BranchText>
  ) : (
    <TreeView.ItemText>{label}</TreeView.ItemText>
  )

  return (
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
      {branchTrigger}
      {leading}
      <Icon />
      {text}
      {trailing}
    </Box>
  )
}
