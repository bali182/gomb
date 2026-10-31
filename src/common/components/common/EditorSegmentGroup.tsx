import { SegmentGroup } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'

import { useEditorContext } from '../../contexts/EditorContext'

export const EditorSegmentGroup: FC<SegmentGroup.RootProps> = ({ onValueChange, ...props }) => {
  const { isComputing, setEditingInputId } = useEditorContext()

  const handleChange = useCallback(
    (details: SegmentGroup.ValueChangeDetails): void => {
      if (isComputing) {
        return
      }
      setEditingInputId(undefined)
      onValueChange?.(details)
    },
    [isComputing, onValueChange, setEditingInputId],
  )

  return <SegmentGroup.Root {...props} aria-readonly={isComputing} onValueChange={handleChange} />
}
