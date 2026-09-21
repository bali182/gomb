import { Tooltip as ChakraTooltip, Portal } from '@chakra-ui/react'
import type { FC, Ref } from 'react'
import { portalRef } from '../../portalRef'

export type TooltipProps = ChakraTooltip.RootProps & {
  content: React.ReactNode
  contentProps?: ChakraTooltip.ContentProps
  disabled?: boolean
  ref?: Ref<HTMLDivElement>
}

export const Tooltip: FC<TooltipProps> = ({ children, disabled, content, contentProps, ref, ...tooltipRootProps }) => {
  if (disabled) {
    return children
  }

  return (
    <ChakraTooltip.Root {...tooltipRootProps}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal container={portalRef}>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content ref={ref} {...contentProps}>
            <ChakraTooltip.Arrow>
              <ChakraTooltip.ArrowTip />
            </ChakraTooltip.Arrow>
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  )
}
