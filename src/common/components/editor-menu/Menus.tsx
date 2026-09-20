import { FC, ReactElement } from 'react'
import { useTranslation2 } from '../../hooks/useTranslation2'
import { BaseMenu } from './BaseMenu'

type CommonMenuProps = {
  children: ReactElement[] | ReactElement
}

export const FileMenu: FC<CommonMenuProps> = ({ children }) => {
  const { t } = useTranslation2()
  return <BaseMenu title={t.project.menus.file.name}>{children}</BaseMenu>
}

export const EditMenu: FC<CommonMenuProps> = ({ children }) => {
  const { t } = useTranslation2()
  return <BaseMenu title={t.project.menus.edit.name}>{children}</BaseMenu>
}

export const ViewMenu: FC<CommonMenuProps> = ({ children }) => {
  const { t } = useTranslation2()
  return <BaseMenu title={t.project.menus.view.name}>{children}</BaseMenu>
}

export const ProjectMenu: FC<CommonMenuProps> = ({ children }) => {
  const { t } = useTranslation2()
  return (
    <BaseMenu title={t.project.menus.project.name} autoFocus={true}>
      {children}
    </BaseMenu>
  )
}

export const AboutMenu: FC<CommonMenuProps> = ({ children }) => {
  const { t } = useTranslation2()
  return <BaseMenu title={t.project.menus.about.name}>{children}</BaseMenu>
}
