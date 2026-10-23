import { Menu } from '@chakra-ui/react'
import { Children, type FC, type ReactElement } from 'react'

type ActionsMenuSectionProps = {
  children: ReactElement | undefined | false | readonly (ReactElement | undefined | false)[]
}

export const ActionsMenuSection: FC<ActionsMenuSectionProps> = ({ children }) => {
  const items = Children.toArray(children)
  if (items.length === 0) {
    return null
  }
  return (
    <>
      {items}
      <Menu.Separator _last={{ display: 'none' }} />
    </>
  )
}
