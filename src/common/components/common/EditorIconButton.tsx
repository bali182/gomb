import { IconButton as ChakraIconButton, type IconButtonProps, type SystemStyleObject } from '@chakra-ui/react'
import type { FC, Ref } from 'react'

export type EditorIconButtonProps = IconButtonProps & {
  readOnly?: boolean
  ref?: Ref<HTMLButtonElement>
}

const readOnlyDisabledStyle: SystemStyleObject = {
  opacity: 1,
  cursor: 'not-allowed',
}

export const EditorIconButton: FC<EditorIconButtonProps> = ({ readOnly, disabled, _disabled, ...props }) => (
  <ChakraIconButton
    {...props}
    disabled={disabled || readOnly}
    _disabled={readOnly === true && disabled !== true ? readOnlyDisabledStyle : _disabled}
  />
)
