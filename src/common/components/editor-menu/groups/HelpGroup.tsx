import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import { PiBug, PiGithubLogo, PiScales } from 'react-icons/pi'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { useTranslation } from '../../../translations/translation'
import { CommandMenuItem } from '../items/CommandMenuItem'

export const HelpGroup: FC = () => {
  const t = useTranslation()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.editor.menus.help.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<CommonCommandIdSchema>
        command="view-source-code"
        title={t.editor.menus.help.help.viewSourceCode}
        icon={PiGithubLogo}
      />
      <CommandMenuItem<CommonCommandIdSchema>
        command="report-issue"
        title={t.editor.menus.help.help.reportIssue}
        icon={PiBug}
      />
      <CommandMenuItem<CommonCommandIdSchema>
        command="view-license"
        title={t.editor.menus.help.help.viewLicense}
        icon={PiScales}
      />
    </Menu.ItemGroup>
  )
}
