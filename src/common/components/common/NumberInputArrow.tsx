import { Box, InputGroup, type InputProps, type SystemStyleObject, type Tokens } from '@chakra-ui/react'
import { useMemo, type FC, type ReactElement, type ReactNode } from 'react'

import { isDefined } from '../../utils/isDefined'

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
  opacity?: number
}

export const NumberInputArrow: FC<NumberInputArrowProps> = ({
  position,
  children,
  startAddon,
  endAddon,
  size,
  opacity,
}) => {
  const arrowFillColor = useMemo<Tokens['colors']>(() => {
    if (position === 'left' || position === 'top-left' || position === 'bottom-left') {
      return isDefined(startAddon) ? 'bg.muted' : 'bg.panel'
    }
    if (position === 'right' || position === 'top-right' || position === 'bottom-right') {
      return isDefined(endAddon) ? 'bg.muted' : 'bg.panel'
    }
    return 'bg.panel'
  }, [position, startAddon, endAddon])

  return (
    <Box
      position="relative"
      width="100%"
      background="bg.panel"
      borderTopLeftRadius={position === 'top-left' ? 0 : 'l2'}
      borderTopRightRadius={position === 'top-right' ? 0 : 'l2'}
      borderBottomLeftRadius={position === 'bottom-left' ? 0 : 'l2'}
      borderBottomRightRadius={position === 'bottom-right' ? 0 : 'l2'}
      pointerEvents="auto"
      isolation="isolate"
      opacity={opacity}
    >
      <Box
        position="absolute"
        inset="0"
        borderWidth="1px"
        borderColor="transparent"
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
          '&::before': { color: 'border' },
          '&::after': { color: arrowFillColor },
          ...NUMBER_INPUT_ARROW_STYLES[position],
        }}
      />
      <InputGroup
        borderRadius="inherit"
        isolation="auto"
        startAddon={startAddon}
        startAddonProps={{
          size,
          px: '1.5',
          borderRadius: 'inherit',
        }}
        endAddon={endAddon}
        endAddonProps={{
          size,
          px: 0,
          borderRadius: 'inherit',
        }}
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
      borderBottomColor: 'currentColor',
    },
    _after: {
      top: `-${OFFSET_ARROW_LENGTH - 2}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `0 4px ${OFFSET_ARROW_INNER_LENGTH}px 4px`,
      borderBottomColor: 'currentColor',
    },
  },
  right: {
    _before: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `5px 0 5px ${OFFSET_ARROW_LENGTH}px`,
      borderLeftColor: 'currentColor',
    },
    _after: {
      left: 'calc(100% - 1px)',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `4px 0 4px ${OFFSET_ARROW_INNER_LENGTH}px`,
      borderLeftColor: 'currentColor',
    },
  },
  bottom: {
    _before: {
      bottom: `-${OFFSET_ARROW_LENGTH}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `${OFFSET_ARROW_LENGTH}px 5px 0 5px`,
      borderTopColor: 'currentColor',
    },
    _after: {
      bottom: `-${OFFSET_ARROW_LENGTH - 2}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `${OFFSET_ARROW_INNER_LENGTH}px 4px 0 4px`,
      borderTopColor: 'currentColor',
    },
  },
  left: {
    _before: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `5px ${OFFSET_ARROW_LENGTH}px 5px 0`,
      borderRightColor: 'currentColor',
    },
    _after: {
      right: 'calc(100% - 1px)',
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: `4px ${OFFSET_ARROW_INNER_LENGTH}px 4px 0`,
      borderRightColor: 'currentColor',
    },
  },
  'top-left': {
    _before: {
      top: '-1px',
      right: '100%',
      borderWidth: `${OFFSET_ARROW_LENGTH}px 0 0 ${OFFSET_ARROW_LENGTH}px`,
      borderTopColor: 'currentColor',
    },
    _after: {
      top: 0,
      right: 'calc(100% - 1px)',
      borderWidth: `${OFFSET_ARROW_INNER_LENGTH}px 0 0 ${OFFSET_ARROW_INNER_LENGTH}px`,
      borderTopColor: 'currentColor',
    },
  },
  'top-right': {
    _before: {
      top: '-1px',
      left: '100%',
      borderWidth: `${OFFSET_ARROW_LENGTH}px ${OFFSET_ARROW_LENGTH}px 0 0`,
      borderTopColor: 'currentColor',
    },
    _after: {
      top: 0,
      left: 'calc(100% - 1px)',
      borderWidth: `${OFFSET_ARROW_INNER_LENGTH}px ${OFFSET_ARROW_INNER_LENGTH}px 0 0`,
      borderTopColor: 'currentColor',
    },
  },
  'bottom-left': {
    _before: {
      bottom: '-1px',
      right: '100%',
      borderWidth: `0 0 ${OFFSET_ARROW_LENGTH}px ${OFFSET_ARROW_LENGTH}px`,
      borderBottomColor: 'currentColor',
    },
    _after: {
      bottom: 0,
      right: 'calc(100% - 1px)',
      borderWidth: `0 0 ${OFFSET_ARROW_INNER_LENGTH}px ${OFFSET_ARROW_INNER_LENGTH}px`,
      borderBottomColor: 'currentColor',
    },
  },
  'bottom-right': {
    _before: {
      bottom: '-1px',
      left: '100%',
      borderWidth: `0 ${OFFSET_ARROW_LENGTH}px ${OFFSET_ARROW_LENGTH}px 0`,
      borderBottomColor: 'currentColor',
    },
    _after: {
      bottom: 0,
      left: 'calc(100% - 1px)',
      borderWidth: `0 ${OFFSET_ARROW_INNER_LENGTH}px ${OFFSET_ARROW_INNER_LENGTH}px 0`,
      borderBottomColor: 'currentColor',
    },
  },
}
