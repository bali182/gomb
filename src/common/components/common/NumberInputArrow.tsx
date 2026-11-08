import { Box, InputGroup, type InputProps, type SystemStyleObject, type Tokens } from '@chakra-ui/react'
import type { FC, ReactElement, ReactNode } from 'react'

export type NumberInputArrowPosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

type NumberInputArrowProps = {
  position: NumberInputArrowPosition
  children: ReactElement<InputProps>
  startAddon?: ReactNode
  endAddon?: ReactNode
  size: InputProps['size']
  borderColor: Tokens['colors'] | undefined
  opacity?: number
}

export const NumberInputArrow: FC<NumberInputArrowProps> = ({
  position,
  children,
  startAddon,
  endAddon,
  size,
  borderColor,
  opacity,
}) => {
  return (
    <Box
      position="relative"
      width="100%"
      background="bg.panel"
      borderTopLeftRadius={position === 'top-left' ? 0 : 'md'}
      borderTopRightRadius={position === 'top-right' ? 0 : 'md'}
      borderBottomLeftRadius={position === 'bottom-left' ? 0 : 'md'}
      borderBottomRightRadius={position === 'bottom-right' ? 0 : 'md'}
      boxShadow="sm"
      pointerEvents="auto"
      isolation="isolate"
      opacity={opacity}
    >
      <Box
        position="absolute"
        inset="0"
        borderWidth="1px"
        borderColor={borderColor ?? 'border'}
        borderRadius="inherit"
        pointerEvents="none"
        zIndex="1"
        css={{
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderColor: 'transparent',
            pointerEvents: 'none',
            zIndex: -1,
          },
          ...NUMBER_INPUT_ARROW_STYLES[position],
        }}
      />
      <InputGroup
        startAddon={startAddon}
        startAddonProps={{
          size,
          px: '1.5',
          borderWidth: 0,
          borderInlineEndWidth: '1px',
          borderRadius: 0,
          background: 'transparent',
          marginInlineEnd: 0,
        }}
        endAddon={endAddon}
        endAddonProps={{
          size,
          px: 0,
          borderWidth: 0,
          borderInlineStartWidth: '1px',
          borderRadius: 0,
          background: 'transparent',
          marginInlineEnd: 0,
        }}
        _focusWithin={{ zIndex: 2 }}
      >
        {children}
      </InputGroup>
    </Box>
  )
}

const OFFSET_ARROW_LENGTH = 8
const OFFSET_ARROW_INNER_LENGTH = OFFSET_ARROW_LENGTH - 1

const NUMBER_INPUT_ARROW_STYLES: Record<NumberInputArrowPosition, SystemStyleObject> = {
  top: {
    _before: {
      top: `-${OFFSET_ARROW_LENGTH}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `0 5px ${OFFSET_ARROW_LENGTH}px 5px`,
      borderBottomColor: 'inherit',
    },
    _after: {
      top: `-${OFFSET_ARROW_LENGTH - 2}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `0 4px ${OFFSET_ARROW_INNER_LENGTH}px 4px`,
      borderBottomColor: 'bg.panel',
    },
  },
  right: {
    _before: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `5px 0 5px ${OFFSET_ARROW_LENGTH}px`,
      borderLeftColor: 'inherit',
    },
    _after: {
      left: 'calc(100% - 1px)',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `4px 0 4px ${OFFSET_ARROW_INNER_LENGTH}px`,
      borderLeftColor: 'bg.panel',
    },
  },
  bottom: {
    _before: {
      bottom: `-${OFFSET_ARROW_LENGTH}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `${OFFSET_ARROW_LENGTH}px 5px 0 5px`,
      borderTopColor: 'inherit',
    },
    _after: {
      bottom: `-${OFFSET_ARROW_LENGTH - 2}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `${OFFSET_ARROW_INNER_LENGTH}px 4px 0 4px`,
      borderTopColor: 'bg.panel',
    },
  },
  left: {
    _before: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `5px ${OFFSET_ARROW_LENGTH}px 5px 0`,
      borderRightColor: 'inherit',
    },
    _after: {
      right: 'calc(100% - 1px)',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `4px ${OFFSET_ARROW_INNER_LENGTH}px 4px 0`,
      borderRightColor: 'bg.panel',
    },
  },
  'top-left': {
    _before: {
      top: '-1px',
      right: '100%',
      borderWidth: `${OFFSET_ARROW_LENGTH}px 0 0 ${OFFSET_ARROW_LENGTH}px`,
      borderTopColor: 'inherit',
    },
    _after: {
      top: 0,
      right: 'calc(100% - 1px)',
      borderWidth: `${OFFSET_ARROW_INNER_LENGTH}px 0 0 ${OFFSET_ARROW_INNER_LENGTH}px`,
      borderTopColor: 'bg.panel',
    },
  },
  'top-right': {
    _before: {
      top: '-1px',
      left: '100%',
      borderWidth: `${OFFSET_ARROW_LENGTH}px ${OFFSET_ARROW_LENGTH}px 0 0`,
      borderTopColor: 'inherit',
    },
    _after: {
      top: 0,
      left: 'calc(100% - 1px)',
      borderWidth: `${OFFSET_ARROW_INNER_LENGTH}px ${OFFSET_ARROW_INNER_LENGTH}px 0 0`,
      borderTopColor: 'bg.panel',
    },
  },
  'bottom-left': {
    _before: {
      bottom: '-1px',
      right: '100%',
      borderWidth: `0 0 ${OFFSET_ARROW_LENGTH}px ${OFFSET_ARROW_LENGTH}px`,
      borderBottomColor: 'inherit',
    },
    _after: {
      bottom: 0,
      right: 'calc(100% - 1px)',
      borderWidth: `0 0 ${OFFSET_ARROW_INNER_LENGTH}px ${OFFSET_ARROW_INNER_LENGTH}px`,
      borderBottomColor: 'bg.panel',
    },
  },
  'bottom-right': {
    _before: {
      bottom: '-1px',
      left: '100%',
      borderWidth: `0 ${OFFSET_ARROW_LENGTH}px ${OFFSET_ARROW_LENGTH}px 0`,
      borderBottomColor: 'inherit',
    },
    _after: {
      bottom: 0,
      left: 'calc(100% - 1px)',
      borderWidth: `0 ${OFFSET_ARROW_INNER_LENGTH}px ${OFFSET_ARROW_INNER_LENGTH}px 0`,
      borderBottomColor: 'bg.panel',
    },
  },
}
