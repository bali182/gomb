import { FC, ReactElement } from 'react'
import { useTranslation } from '../../translations/translation'
import { BaseMenu } from './BaseMenu'

type CommonMenuProps = {
  children: ReactElement[] | ReactElement
}

export const FileMenu: FC<CommonMenuProps> = ({ children }) => {
  const t = useTranslation()
  return <BaseMenu title={t.editor.menus.file.name}>{children}</BaseMenu>
}

export const EditMenu: FC<CommonMenuProps> = ({ children }) => {
  const t = useTranslation()
  return <BaseMenu title={t.editor.menus.edit.name}>{children}</BaseMenu>
}

export const ViewMenu: FC<CommonMenuProps> = ({ children }) => {
  const t = useTranslation()
  return <BaseMenu title={t.editor.menus.view.name}>{children}</BaseMenu>
}

export const ProjectMenu: FC<CommonMenuProps> = ({ children }) => {
  const t = useTranslation()
  return (
    <BaseMenu title={t.editor.menus.project.name} autoFocus={true}>
      {children}
    </BaseMenu>
  )
}

export const HelpMenu: FC<CommonMenuProps> = ({ children }) => {
  const t = useTranslation()
  return <BaseMenu title={t.editor.menus.help.name}>{children}</BaseMenu>
}
