import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import { PiRuler } from 'react-icons/pi'
import { useTranslation } from '../../../hooks/useTranslation'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { CommandMenuItem } from '../items/CommandMenuItem'

export const ScalingMenuGroup: FC = () => {
  const { t } = useTranslation()

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
