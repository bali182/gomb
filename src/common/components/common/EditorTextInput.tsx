import { Input, type InputProps } from '@chakra-ui/react'
import { useCallback, type ChangeEvent, type FC } from 'react'

import { useEditorContext } from '../../contexts/EditorContext'

type EditorTextInputProps = InputProps & {
  modelId: string
  field: string
}

export const EditorTextInput: FC<EditorTextInputProps> = ({ modelId, field, onChange, readOnly, ...props }) => {
  const { isComputing, editingInputId, setEditingInputId } = useEditorContext()
  const inputId = `${modelId}:${field}`
  const editorReadOnly = isComputing && editingInputId !== inputId
  const isReadOnly = readOnly || editorReadOnly

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      if (isReadOnly) {
        return
      }
      setEditingInputId(inputId)
      onChange?.(event)
    },
    [setEditingInputId, inputId, isReadOnly, onChange],
  )

  return <Input {...props} onChange={handleChange} readOnly={isReadOnly} />
}
