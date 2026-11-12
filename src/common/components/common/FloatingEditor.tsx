import { Popover, usePopover } from '@chakra-ui/react'
import { FC, MouseEvent, ReactNode, useCallback, useEffect, useMemo } from 'react'

import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { isDefined } from '../../utils/isDefined'

type FloatingEditorProps = {
  anchorElement: FloatingEditorAnchor
  children: ReactNode
  onClose: () => void
  positioning?: 'to-svg' | 'to-tree'
  maxHeight?: string
}

export const FloatingEditor: FC<FloatingEditorProps> = ({
  anchorElement,
  children,
  onClose,
  positioning = 'to-svg',
  maxHeight,
}) => {
  const positioningTarget = useMemo<FloatingEditorAnchor>(
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
      ...(positioning === 'to-tree' ? treePositioning : svgPositioning),
      getAnchorElement: () => positioningTarget,
      gutter: 10,
      overlap: true,
      overflowPadding: 8,
      arrowPadding: 14,
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
    const contextElement = anchorElement.contextElement
    const editorElement =
      contextElement instanceof SVGElement
        ? contextElement.ownerSVGElement?.parentElement
        : contextElement.parentElement

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
        <Popover.Content
          onClick={stopPropagation}
          onMouseUp={stopPropagation}
          width="450px"
          maxHeight={maxHeight}
          display="flex"
          flexDirection="column"
          zIndex="popover"
        >
          <Popover.Arrow />
          {children}
        </Popover.Content>
      </Popover.Positioner>
    </Popover.RootProvider>
  )
}

const svgPositioning: Popover.RootProps['positioning'] = {
  placement: 'right-start',
  flip: [
    'right',
    'right-end',
    'left-start',
    'left',
    'left-end',
    'bottom-start',
    'bottom',
    'bottom-end',
    'top-start',
    'top',
    'top-end',
  ],
}

const treePositioning: Popover.RootProps['positioning'] = {
  placement: 'left',
  flip: [
    'left-start',
    'left-end',
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'right',
    'right-start',
    'right-end',
  ],
}
