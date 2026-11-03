import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { useCallback, useId, type FC, type PointerEvent, type ReactNode } from 'react'
import { PiCaretRight } from 'react-icons/pi'
import { isDefined } from '../../../utils/isDefined'
import { useResizableAccordionContext } from './ResizableAccordionContext'

export type ResizableAccordionItemProps = {
  id: string
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export const ResizableAccordionItem: FC<ResizableAccordionItemProps> = ({ id, title, actions, children }) => {
  const {
    items,
    animate,
    draggingId,
    registerHeader,
    toggleItem,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
  } = useResizableAccordionContext()
  const contentId = useId()
  const headerId = useId()
  const item = items[id]

  const headerRef = useCallback(
    (element: HTMLDivElement | null): void => {
      registerHeader(id, element)
    },
    [id, registerHeader],
  )
  const handleToggle = useCallback((): void => {
    toggleItem(id)
  }, [id, toggleItem])

  const handleResizePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      handlePointerDown(id, event)
    },
    [id, handlePointerDown],
  )

  return (
    <>
      <Flex
        ref={headerRef}
        alignItems="center"
        bg="bg.muted"
        borderBottomWidth="1px"
        borderTopWidth={item.first ? '0' : '1px'}
        flexShrink="0"
        height="9"
        position="relative"
      >
        <Button
          id={headerId}
          aria-controls={contentId}
          aria-expanded={item.open}
          borderRadius="0"
          flex="1"
          fontSize="sm"
          height="100%"
          justifyContent="flex-start"
          minWidth="0"
          onClick={handleToggle}
          px="2"
          size="sm"
          variant="ghost"
        >
          <Box
            as="span"
            flexShrink="0"
            transform={item.open ? 'rotate(90deg)' : 'rotate(0deg)'}
            transition={animate ? 'transform 200ms' : 'none'}
          >
            <PiCaretRight />
          </Box>
          <Text truncate>{title}</Text>
        </Button>
        {isDefined(actions) && (
          <Box flexShrink="0" pr="1">
            {actions}
          </Box>
        )}
        <Box
          aria-labelledby={headerId}
          aria-orientation="horizontal"
          aria-valuenow={item.resizeValue}
          aria-valuemin={0}
          aria-valuemax={100}
          bg={draggingId === id ? 'border.emphasized' : 'transparent'}
          cursor="row-resize"
          display={isDefined(item.previousOpenId) ? 'block' : 'none'}
          height="6px"
          left="0"
          onLostPointerCapture={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          position="absolute"
          right="0"
          role="separator"
          top="-3px"
          touchAction="none"
          zIndex="1"
          _hover={{ bg: 'border.emphasized' }}
        />
      </Flex>
      <Box
        id={contentId}
        inert={!item.open}
        aria-hidden={!item.open}
        flexShrink="0"
        minHeight="0"
        overflow="hidden"
        style={{ height: item.height, transition: animate ? 'height 200ms cubic-bezier(0.2, 0, 0, 1)' : 'none' }}
      >
        <Box height="100%" minHeight="0" overflow="auto" p="2">
          {children}
        </Box>
      </Box>
    </>
  )
}
