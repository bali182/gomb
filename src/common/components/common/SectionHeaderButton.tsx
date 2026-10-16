import { Button, type ButtonProps } from '@chakra-ui/react'
import type { FC, Ref } from 'react'

type SectionHeaderButtonProps = ButtonProps & {
  ref?: Ref<HTMLButtonElement>
}

export const SectionHeaderButton: FC<SectionHeaderButtonProps> = ({ ref, ...props }) => {
  return (
    <Button
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
