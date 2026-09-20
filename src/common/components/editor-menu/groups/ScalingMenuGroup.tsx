import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import { PiRuler } from 'react-icons/pi'
import { useTranslation2 } from '../../../hooks/useTranslation2'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { CommandMenuItem } from '../items/CommandMenuItem'

export const ScalingMenuGroup: FC = () => {
  const { t } = useTranslation2()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.view.scaling.name}</Menu.ItemGroupLabel>
      <CommandMenuItem<CommonCommandIdSchema>
        command="scaling"
        title={t.project.menus.view.scaling.scaling}
        icon={PiRuler}
      />
    </Menu.ItemGroup>
  )
}
