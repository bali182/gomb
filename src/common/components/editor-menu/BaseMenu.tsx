import { Button, Menu, Portal } from '@chakra-ui/react'
import { Children, FC, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { PiCaretDown } from 'react-icons/pi'
import { portalRef } from '../../portalRef'
import { intersperse } from '../../utils/intersperse'

export type BaseMenuProps = {
  title: string
  autoFocus?: boolean
  children: ReactElement[] | ReactElement
}

export const BaseMenu: FC<BaseMenuProps> = ({ title, autoFocus, children }: BaseMenuProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOpen, setOpen] = useState(false)

  const handleOpenChange = useCallback(({ open }: Menu.OpenChangeDetails) => setOpen(open), [])

  // Menu focuses the first tabbable descendant in its own animation frame. Run after it and only when opening:
  // rerunning after an input value update would steal focus from the edited input.
  useEffect(() => {
    if (!isOpen || !autoFocus) {
      return
    }
    const frameId = requestAnimationFrame(() => contentRef.current?.focus())
    return () => cancelAnimationFrame(frameId)
  }, [autoFocus, isOpen])

  const withSeparators = intersperse(Children.toArray(children), (prev, next) => (
    <Menu.Separator key={`${prev}-${next}-separator`} />
  ))

  return (
    <Menu.Root onOpenChange={handleOpenChange}>
      <Menu.Trigger asChild>
        <Button size="sm" variant="ghost">
          <PiCaretDown />
          {title}
        </Button>
      </Menu.Trigger>
      <Portal container={portalRef}>
        <Menu.Positioner>
          <Menu.Content ref={contentRef}>{withSeparators}</Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
