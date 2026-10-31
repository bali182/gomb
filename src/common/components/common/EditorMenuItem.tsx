import { Menu, type SystemStyleObject } from '@chakra-ui/react'
import type { FC, Ref } from 'react'

export type EditorMenuItemProps = Menu.ItemProps & {
  readOnly?: boolean
  ref?: Ref<HTMLDivElement>
}

const readOnlyDisabledStyle: SystemStyleObject = {
  opacity: 1,
  cursor: 'not-allowed',
}

export const EditorMenuItem: FC<EditorMenuItemProps> = ({ readOnly, disabled, _disabled, ...props }) => (
  <Menu.Item
    {...props}
    disabled={disabled || readOnly}
    _disabled={readOnly === true && disabled !== true ? readOnlyDisabledStyle : _disabled}
  />
)
