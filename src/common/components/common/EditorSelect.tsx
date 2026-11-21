import { ReactElement, useCallback } from 'react'
import { useEditorContext } from '../../contexts/EditorContext'
import { InputSelect, InputSelectProps } from './InputSelect'

export type EditorSelectProps<T extends string> = InputSelectProps<T>

export const EditorSelect = <T extends string>({
  onChange,
  readOnly,
  ...props
}: EditorSelectProps<T>): ReactElement => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const isReadOnly = readOnly || isComputing

  const handleChange = useCallback(
    (value: T): void => {
      if (isReadOnly) {
        return
      }
      setEditingInputId(undefined)
      onChange(value)
    },
    [isReadOnly, onChange, setEditingInputId],
  )

  return <InputSelect {...props} readOnly={isReadOnly} onChange={handleChange} />
}
