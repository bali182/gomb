import type { FC } from 'react'
import { EditorButton, type EditorButtonProps } from './EditorButton'

export const MiniButton: FC<EditorButtonProps> = ({ ref, ...props }) => {
  return (
    <EditorButton
      ref={ref}
      size="2xs"
      height="5"
      borderRadius="full"
      borderColor="border.emphasized"
      variant="subtle"
      {...props}
    />
  )
}
