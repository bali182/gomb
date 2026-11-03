import { Button, IconButton, type ButtonProps, type IconButtonProps, type SystemStyleObject } from '@chakra-ui/react'
import type { FC } from 'react'

const headerButtonHoverStyles: SystemStyleObject = {
  color: 'fg',
}

export const ResizableAccordionHeaderButton: FC<ButtonProps> = (props) => (
  <Button {...props} size="xs" variant="plain" color="fg.muted" _hover={headerButtonHoverStyles} />
)

export const ResizableAccordionHeaderIconButton: FC<IconButtonProps> = (props) => (
  <IconButton {...props} size="xs" variant="plain" color="fg.muted" _hover={headerButtonHoverStyles} />
)
