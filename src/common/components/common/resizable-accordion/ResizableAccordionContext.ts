import { createContext, useContext, type PointerEvent } from 'react'
import { isDefined } from '../../../utils/isDefined'

export type ResizableAccordionItemLayout = {
  open: boolean
  height: number
  first: boolean
  previousOpenId: string | undefined
  resizeValue: number
}

export type ResizableAccordionContextValue = {
  items: Record<string, ResizableAccordionItemLayout>
  animate: boolean
  draggingId: string | undefined
  registerHeader: (id: string, element: HTMLDivElement | null) => void
  toggleItem: (id: string) => void
  handlePointerDown: (id: string, event: PointerEvent<HTMLDivElement>) => void
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void
  handlePointerEnd: (event: PointerEvent<HTMLDivElement>) => void
}

export const ResizableAccordionContext = createContext<ResizableAccordionContextValue | undefined>(undefined)

export const useResizableAccordionContext = (): ResizableAccordionContextValue => {
  const context = useContext(ResizableAccordionContext)
  if (!isDefined(context)) {
    throw new Error('ResizableAccordionItem must be rendered inside ResizableAccordion.')
  }
  return context
}
