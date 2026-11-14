import type { SystemStyleObject } from '@chakra-ui/react'

export const multipleSelectedTreeItemStyles: SystemStyleObject = {
  bg: 'transparent',
  color: 'inherit',
  '&:hover, &:focus-visible': {
    bg: 'bg.muted',
  },
}

export const disabledTreeItemStyles: SystemStyleObject = {
  cursor: 'default',
  '&:hover, &:focus-visible': {
    bg: 'transparent',
  },
  _selected: {
    '&:hover, &:focus-visible': {
      bg: 'transparent',
    },
  },
}
