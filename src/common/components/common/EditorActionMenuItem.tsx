import type { Menu } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'

import { useEditorContext } from '../../contexts/EditorContext'
import { EditorMenuItem } from './EditorMenuItem'

export const EditorActionMenuItem: FC<Menu.ItemProps> = ({ onSelect, disabled, ...props }) => {
  const { isComputing, setEditingInputId } = useEditorContext()

  const handleSelect = useCallback((): void => {
    setEditingInputId(undefined)
    onSelect?.()
  }, [onSelect, setEditingInputId])

  return <EditorMenuItem {...props} disabled={disabled} readOnly={isComputing} onSelect={handleSelect} />
}
