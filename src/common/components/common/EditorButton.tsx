import { Button as ChakraButton, type ButtonProps, type SystemStyleObject } from '@chakra-ui/react'
import type { FC, Ref } from 'react'

export type EditorButtonProps = ButtonProps & {
  readOnly?: boolean
  ref?: Ref<HTMLButtonElement>
}

const readOnlyDisabledStyle: SystemStyleObject = {
  opacity: 1,
  cursor: 'not-allowed',
}

export const EditorButton: FC<EditorButtonProps> = ({ readOnly, disabled, _disabled, ...props }) => (
  <ChakraButton
    {...props}
    disabled={disabled || readOnly}
    _disabled={readOnly === true && disabled !== true ? readOnlyDisabledStyle : _disabled}
  />
)
