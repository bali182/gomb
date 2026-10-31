import { useCallback, type FC } from 'react'

import { useEditorContext } from '../../contexts/EditorContext'
import { isDefined } from '../../utils/isDefined'
import { ColorInput, type ColorInputProps } from './ColorInput'

type EditorColorInputProps = ColorInputProps & {
  modelId: string
  field: string
}

export const EditorColorInput: FC<EditorColorInputProps> = ({
  modelId,
  field,
  onChange,
  onReset,
  readOnly,
  ...props
}) => {
  const { isComputing, editingInputId, setEditingInputId } = useEditorContext()
  const inputId = `${modelId}:${field}`
  const editorReadOnly = isComputing && editingInputId !== inputId
  const isReadOnly = readOnly === true || editorReadOnly
  const handleChange = useCallback(
    (value: string): void => {
      if (isReadOnly) {
        return
      }
      setEditingInputId(inputId)
      onChange(value)
    },
    [setEditingInputId, inputId, isReadOnly, onChange],
  )
  const handleReset = useCallback((): void => {
    setEditingInputId(inputId)
    onReset?.()
  }, [setEditingInputId, inputId, onReset])

  return (
    <ColorInput
      {...props}
      onChange={handleChange}
      onReset={isDefined(onReset) ? handleReset : undefined}
      readOnly={isReadOnly}
    />
  )
}
