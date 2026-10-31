import { Select } from '@chakra-ui/react'
import { useCallback, type ReactElement } from 'react'

import { useEditorContext } from '../../contexts/EditorContext'

export const EditorSelect = <T extends string>({
  onValueChange,
  readOnly,
  ...props
}: Select.RootProps<T>): ReactElement => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const isReadOnly = readOnly || isComputing

  const handleChange = useCallback(
    (details: Select.ValueChangeDetails<T>): void => {
      if (isReadOnly) {
        return
      }
      setEditingInputId(undefined)
      onValueChange?.(details)
    },
    [isReadOnly, onValueChange, setEditingInputId],
  )

  return <Select.Root {...props} readOnly={isReadOnly} onValueChange={handleChange} />
}
