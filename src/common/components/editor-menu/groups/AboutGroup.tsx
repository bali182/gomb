import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import { PiBug, PiGithubLogo, PiScales } from 'react-icons/pi'
import { useTranslation2 } from '../../../hooks/useTranslation2'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { CommandMenuItem } from '../items/CommandMenuItem'

export const AboutGroup: FC = () => {
  const { t } = useTranslation2()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.about.resources.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<CommonCommandIdSchema>
        command="view-source-code"
        title={t.project.menus.about.resources.viewSourceCode}
        icon={PiGithubLogo}
      />
      <CommandMenuItem<CommonCommandIdSchema>
        command="report-issue"
        title={t.project.menus.about.resources.reportIssue}
        icon={PiBug}
      />
      <CommandMenuItem<CommonCommandIdSchema>
        command="view-license"
        title={t.project.menus.about.resources.viewLicense}
        icon={PiScales}
      />
    </Menu.ItemGroup>
  )
}
