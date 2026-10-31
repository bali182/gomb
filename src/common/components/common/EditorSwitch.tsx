import { Switch } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'

import { useEditorContext } from '../../contexts/EditorContext'

export const EditorSwitch: FC<Switch.RootProps> = ({ onCheckedChange, readOnly, ...props }) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const isReadOnly = readOnly || isComputing

  const handleChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      if (isReadOnly) {
        return
      }
      setEditingInputId(undefined)
      onCheckedChange?.(details)
    },
    [isReadOnly, onCheckedChange, setEditingInputId],
  )

  return <Switch.Root {...props} readOnly={isReadOnly} onCheckedChange={handleChange} />
}
