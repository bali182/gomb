import { Flex } from '@chakra-ui/react'
import {
  Children,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { isDefined } from '../../../utils/isDefined'
import {
  ResizableAccordionContext,
  type ResizableAccordionContextValue,
  type ResizableAccordionItemLayout,
} from './ResizableAccordionContext'
import { ResizableAccordionItem, type ResizableAccordionItemProps } from './ResizableAccordionItem'

export type ResizableAccordionItemState = {
  open: boolean
  size: number
}

export type ResizableAccordionState = Record<string, ResizableAccordionItemState>

export type ResizableAccordionProps = {
  value: ResizableAccordionState
  onValueChange: (value: ResizableAccordionState) => void
  children: ReactNode
}

type AccordionRuntime = {
  value: ResizableAccordionState
  onValueChange: (value: ResizableAccordionState) => void
  itemIds: string[]
  availableHeight: number
}

type AccordionMeasurements = {
  availableHeight: number
  headers: Record<string, DOMRect>
}

type AccordionResizePair = {
  beforeId: string
  afterId: string
  beforeHeight: number
  afterHeight: number
}

type AccordionDrag = {
  pair: AccordionResizePair
  pointerId: number
  clientY: number
  grabOffset: number
  target: HTMLDivElement
}

const MIN_CONTENT_HEIGHT = 48

// Full AI code. No idea how this works, don't try to understand it.
export const ResizableAccordion: FC<ResizableAccordionProps> = ({ value, onValueChange, children }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const headersRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const observerRef = useRef<ResizeObserver | undefined>(undefined)
  const frameRef = useRef<number | undefined>(undefined)
  const dragRef = useRef<AccordionDrag | undefined>(undefined)
  const [availableHeight, setAvailableHeight] = useState<number>(0)
  const [draggingId, setDraggingId] = useState<string | undefined>(undefined)
  const [animatedValue, setAnimatedValue] = useState<ResizableAccordionState | undefined>(undefined)
  const itemIds = useMemo<string[]>((): string[] => {
    const ids = Children.toArray(children).map((child: ReactNode): string => {
      if (!isValidElement<ResizableAccordionItemProps>(child) || child.type !== ResizableAccordionItem) {
        throw new Error('ResizableAccordion accepts direct ResizableAccordionItem children only.')
      }
      return child.props.id
    })
    if (new Set(ids).size !== ids.length) {
      throw new Error('ResizableAccordionItem ids must be unique.')
    }
    return ids
  }, [children])

  const runtimeRef = useRef<AccordionRuntime>({ value, onValueChange, itemIds, availableHeight })

  const cancelFrame = useCallback((): void => {
    if (isDefined(frameRef.current)) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = undefined
    }
  }, [])

  const stopDrag = useCallback((): void => {
    cancelFrame()
    const drag = dragRef.current
    dragRef.current = undefined
    setDraggingId(undefined)
    if (isDefined(drag) && drag.target.hasPointerCapture(drag.pointerId)) {
      drag.target.releasePointerCapture(drag.pointerId)
    }
  }, [cancelFrame])

  const measure = useCallback((ids: string[]): AccordionMeasurements | undefined => {
    const container = containerRef.current
    if (!isDefined(container)) {
      return undefined
    }
    const headers: Record<string, DOMRect> = {}
    let headerHeight = 0
    for (const id of ids) {
      const header = headersRef.current.get(id)
      if (!isDefined(header)) {
        return undefined
      }
      const rect = header.getBoundingClientRect()
      headers[id] = rect
      headerHeight += rect.height
    }
    return { availableHeight: Math.max(0, container.clientHeight - headerHeight), headers }
  }, [])

  const resizePair = useCallback((id: string, beforeHeight: number, height: number): void => {
    const current = runtimeRef.current
    setAnimatedValue(undefined)
    setAvailableHeight(height)
    if (height <= 0) {
      return
    }
    const heights = getContentHeights(current.itemIds, current.value, height)
    const pair = getResizePair(id, current.itemIds, current.value, heights)
    if (!isDefined(pair)) {
      return
    }
    const openIds = current.itemIds.filter((itemId: string): boolean => current.value[itemId].open)
    const minimum = Math.min(MIN_CONTENT_HEIGHT, height / openIds.length)
    const pairHeight = pair.beforeHeight + pair.afterHeight
    const nextHeight = Math.max(minimum, Math.min(pairHeight - minimum, beforeHeight))
    if (Math.abs(nextHeight - pair.beforeHeight) < 0.01) {
      return
    }
    heights[pair.beforeId] = nextHeight
    heights[pair.afterId] = pairHeight - nextHeight
    const totalSize = openIds.reduce((sum: number, itemId: string): number => sum + current.value[itemId].size, 0)
    const nextValue = { ...current.value }
    // Rebase the weights on the visible heights so constrained siblings keep their size.
    for (const itemId of openIds) {
      nextValue[itemId] = { ...current.value[itemId], size: (heights[itemId] / height) * totalSize }
    }
    current.onValueChange(nextValue)
  }, [])

  const updateDrag = useCallback((): void => {
    const drag = dragRef.current
    if (!isDefined(drag)) {
      return
    }
    const current = runtimeRef.current
    const measurements = measure(current.itemIds)
    if (!isDefined(measurements)) {
      stopDrag()
      return
    }
    const heights = getContentHeights(current.itemIds, current.value, measurements.availableHeight)
    const pair = getResizePair(drag.pair.afterId, current.itemIds, current.value, heights)
    if (!isDefined(pair) || pair.beforeId !== drag.pair.beforeId) {
      stopDrag()
      return
    }
    const beforeIndex = current.itemIds.indexOf(pair.beforeId)
    const afterIndex = current.itemIds.indexOf(pair.afterId)
    let intermediateHeaderHeight = 0
    for (let index = beforeIndex + 1; index < afterIndex; index++) {
      intermediateHeaderHeight += measurements.headers[current.itemIds[index]].height
    }
    const height =
      drag.clientY - drag.grabOffset - measurements.headers[pair.beforeId].bottom - intermediateHeaderHeight
    resizePair(pair.afterId, height, measurements.availableHeight)
  }, [measure, resizePair, stopDrag])

  const scheduleFrame = useCallback((): void => {
    if (isDefined(frameRef.current)) {
      return
    }
    frameRef.current = requestAnimationFrame((): void => {
      frameRef.current = undefined
      updateDrag()
    })
  }, [updateDrag])

  const refreshMeasurements = useCallback((): void => {
    const current = runtimeRef.current
    const measurements = measure(current.itemIds)
    if (!isDefined(measurements)) {
      return
    }
    if (measurements.availableHeight !== current.availableHeight) {
      setAnimatedValue(undefined)
      setAvailableHeight(measurements.availableHeight)
      if (isDefined(dragRef.current)) {
        scheduleFrame()
      }
    }
  }, [measure, scheduleFrame])

  useLayoutEffect(() => {
    runtimeRef.current = { value, onValueChange, itemIds, availableHeight }
    if (isDefined(animatedValue) && value !== animatedValue) {
      setAnimatedValue(undefined)
    }
    const drag = dragRef.current
    if (isDefined(drag)) {
      const heights = getContentHeights(itemIds, value, availableHeight)
      const pair = getResizePair(drag.pair.afterId, itemIds, value, heights)
      if (!isDefined(pair) || pair.beforeId !== drag.pair.beforeId) {
        stopDrag()
      }
    }
  }, [value, onValueChange, itemIds, availableHeight, animatedValue, stopDrag])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!isDefined(container)) {
      return
    }
    const observer = new ResizeObserver(refreshMeasurements)
    observerRef.current = observer
    observer.observe(container)
    for (const header of headersRef.current.values()) {
      observer.observe(header)
    }
    return (): void => {
      observer.disconnect()
      observerRef.current = undefined
      cancelFrame()
      const drag = dragRef.current
      dragRef.current = undefined
      if (isDefined(drag) && drag.target.hasPointerCapture(drag.pointerId)) {
        drag.target.releasePointerCapture(drag.pointerId)
      }
    }
  }, [cancelFrame, refreshMeasurements])

  useLayoutEffect(() => {
    refreshMeasurements()
  }, [itemIds, refreshMeasurements])

  const registerHeader = useCallback((id: string, element: HTMLDivElement | null): void => {
    const previous = headersRef.current.get(id)
    if (isDefined(previous)) {
      observerRef.current?.unobserve(previous)
    }
    if (isDefined(element)) {
      headersRef.current.set(id, element)
      observerRef.current?.observe(element)
    } else {
      headersRef.current.delete(id)
    }
  }, [])

  const toggleItem = useCallback(
    (id: string): void => {
      const current = runtimeRef.current
      stopDrag()
      const nextValue = { ...current.value, [id]: { ...current.value[id], open: !current.value[id].open } }
      setAnimatedValue(nextValue)
      current.onValueChange(nextValue)
    },
    [stopDrag],
  )

  const handlePointerDown = useCallback(
    (id: string, event: PointerEvent<HTMLDivElement>): void => {
      if (event.button !== 0 || isDefined(dragRef.current)) {
        return
      }
      const current = runtimeRef.current
      const measurements = measure(current.itemIds)
      if (!isDefined(measurements) || measurements.availableHeight <= 0) {
        return
      }
      const heights = getContentHeights(current.itemIds, current.value, measurements.availableHeight)
      const pair = getResizePair(id, current.itemIds, current.value, heights)
      if (!isDefined(pair)) {
        return
      }
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      dragRef.current = {
        pair,
        pointerId: event.pointerId,
        clientY: event.clientY,
        grabOffset: event.clientY - measurements.headers[id].top,
        target: event.currentTarget,
      }
      setAnimatedValue(undefined)
      setDraggingId(id)
    },
    [measure],
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current
      if (!isDefined(drag) || drag.pointerId !== event.pointerId) {
        return
      }
      drag.clientY = event.clientY
      scheduleFrame()
    },
    [scheduleFrame],
  )

  const handlePointerEnd = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current
      if (!isDefined(drag) || drag.pointerId !== event.pointerId) {
        return
      }
      cancelFrame()
      if (event.type === 'pointerup') {
        drag.clientY = event.clientY
        updateDrag()
      }
      stopDrag()
    },
    [cancelFrame, stopDrag, updateDrag],
  )

  const items = useMemo<Record<string, ResizableAccordionItemLayout>>((): Record<
    string,
    ResizableAccordionItemLayout
  > => {
    const heights = getContentHeights(itemIds, value, availableHeight)
    const layouts: Record<string, ResizableAccordionItemLayout> = {}
    for (const [index, id] of itemIds.entries()) {
      const pair = getResizePair(id, itemIds, value, heights)
      layouts[id] = {
        open: value[id].open,
        height: heights[id],
        first: index === 0,
        previousOpenId: availableHeight > 0 ? pair?.beforeId : undefined,
        resizeValue:
          isDefined(pair) && pair.beforeHeight + pair.afterHeight > 0
            ? Math.round((pair.beforeHeight / (pair.beforeHeight + pair.afterHeight)) * 100)
            : 0,
      }
    }
    return layouts
  }, [availableHeight, itemIds, value])

  const context = useMemo<ResizableAccordionContextValue>(
    (): ResizableAccordionContextValue => ({
      items,
      animate: value === animatedValue && !isDefined(draggingId),
      draggingId,
      registerHeader,
      toggleItem,
      handlePointerDown,
      handlePointerMove,
      handlePointerEnd,
    }),
    [
      items,
      value,
      animatedValue,
      draggingId,
      registerHeader,
      toggleItem,
      handlePointerDown,
      handlePointerMove,
      handlePointerEnd,
    ],
  )

  return (
    <ResizableAccordionContext.Provider value={context}>
      <Flex
        ref={containerRef}
        direction="column"
        height="100%"
        minHeight="0"
        minWidth="0"
        overflow="hidden"
        userSelect={isDefined(draggingId) ? 'none' : undefined}
      >
        {children}
      </Flex>
    </ResizableAccordionContext.Provider>
  )
}

const getContentHeights = (
  itemIds: string[],
  value: ResizableAccordionState,
  availableHeight: number,
): Record<string, number> => {
  const heights: Record<string, number> = Object.fromEntries(itemIds.map((id: string) => [id, 0]))
  let remainingIds = itemIds.filter((id: string): boolean => {
    const item = value[id]
    if (!isDefined(item) || !Number.isFinite(item.size) || item.size <= 0) {
      throw new Error(`ResizableAccordion requires an open state and a positive size for item "${id}".`)
    }
    return item.open
  })
  if (remainingIds.length === 0) {
    return heights
  }
  if (availableHeight <= MIN_CONTENT_HEIGHT * remainingIds.length) {
    for (const id of remainingIds) {
      heights[id] = availableHeight / remainingIds.length
    }
    return heights
  }
  let remainingHeight = availableHeight
  while (remainingIds.length > 0) {
    const totalSize = remainingIds.reduce((sum: number, id: string): number => sum + value[id].size, 0)
    const constrainedIds = remainingIds.filter(
      (id: string): boolean => (remainingHeight * value[id].size) / totalSize < MIN_CONTENT_HEIGHT,
    )
    if (constrainedIds.length === 0) {
      for (const id of remainingIds) {
        heights[id] = (remainingHeight * value[id].size) / totalSize
      }
      break
    }
    for (const id of constrainedIds) {
      heights[id] = MIN_CONTENT_HEIGHT
    }
    remainingHeight -= constrainedIds.length * MIN_CONTENT_HEIGHT
    remainingIds = remainingIds.filter((id: string): boolean => !constrainedIds.includes(id))
  }
  return heights
}

const getResizePair = (
  id: string,
  itemIds: string[],
  value: ResizableAccordionState,
  heights: Record<string, number>,
): AccordionResizePair | undefined => {
  let previousOpenId: string | undefined
  for (const itemId of itemIds) {
    if (itemId === id) {
      if (!value[itemId].open || !isDefined(previousOpenId)) {
        return undefined
      }
      return {
        beforeId: previousOpenId,
        afterId: id,
        beforeHeight: heights[previousOpenId],
        afterHeight: heights[id],
      }
    }
    if (value[itemId].open) {
      previousOpenId = itemId
    }
  }
  return undefined
}
