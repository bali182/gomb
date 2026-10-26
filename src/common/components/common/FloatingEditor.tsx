import { Popover, usePopover } from '@chakra-ui/react'
import { FC, MouseEvent, ReactNode, useCallback, useEffect, useMemo } from 'react'

import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { isDefined } from '../../utils/isDefined'

type FloatingEditorProps = {
  anchorElement: FloatingEditorAnchor
  children: ReactNode
  onClose: () => void
}

export const FloatingEditor: FC<FloatingEditorProps> = ({ anchorElement, children, onClose }) => {
  const positioningTarget = useMemo(
    () => ({
      getBoundingClientRect: anchorElement.getBoundingClientRect,
      contextElement: anchorElement.contextElement,
    }),
    [anchorElement],
  )
  const popover = usePopover({
    open: true,
    onPointerDownOutside: (event) => {
      if (event.detail.originalEvent.pointerType !== 'mouse') {
        return
      }
      event.preventDefault()
    },
    onOpenChange: ({ open }) => {
      if (!open) {
        onClose()
      }
    },
    positioning: {
      flip: ['left-start', 'bottom', 'top', 'right-start'],
      getAnchorElement: () => positioningTarget,
      gutter: 10,
      overlap: true,
      overflowPadding: 8,
      placement: 'right-start',
      strategy: 'fixed',
    },
  })

  useEffect(() => {
    const ownerDocument = anchorElement.contextElement.ownerDocument
    ownerDocument.addEventListener('mouseup', onClose)

    return (): void => {
      ownerDocument.removeEventListener('mouseup', onClose)
    }
  }, [anchorElement.contextElement, onClose])

  useEffect(() => {
    const editorElement = anchorElement.contextElement.ownerSVGElement?.parentElement

    if (!isDefined(editorElement)) {
      return
    }

    const observer = new ResizeObserver((): void => {
      popover.reposition()
    })

    observer.observe(editorElement)

    return (): void => {
      observer.disconnect()
    }
  }, [anchorElement.contextElement, popover])

  const stopPropagation = useCallback((event: MouseEvent): void => {
    event.stopPropagation()
  }, [])

  return (
    <Popover.RootProvider value={popover}>
      <Popover.Positioner>
        <Popover.Content onClick={stopPropagation} onMouseUp={stopPropagation} width="450px" zIndex="popover">
          <Popover.Arrow />
          {children}
        </Popover.Content>
      </Popover.Positioner>
    </Popover.RootProvider>
  )
}
