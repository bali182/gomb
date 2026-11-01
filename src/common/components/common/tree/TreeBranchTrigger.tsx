import { TreeView } from '@chakra-ui/react'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiCaretRight } from 'react-icons/pi'

type TreeBranchTriggerProps = {
  isExpandable: boolean
}

export const TreeBranchTrigger: FC<TreeBranchTriggerProps> = ({ isExpandable }) => {
  const handleDisabledClickCapture = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
  }, [])

  return (
    <TreeView.BranchTrigger
      alignSelf="stretch"
      aria-disabled={!isExpandable}
      cursor={isExpandable ? undefined : 'not-allowed'}
      flexShrink="0"
      mx="-2"
      onClickCapture={!isExpandable ? handleDisabledClickCapture : undefined}
      opacity={isExpandable ? undefined : 0.4}
      px="2"
    >
      <TreeView.BranchIndicator asChild transition="transform 200ms">
        <PiCaretRight />
      </TreeView.BranchIndicator>
    </TreeView.BranchTrigger>
  )
}
