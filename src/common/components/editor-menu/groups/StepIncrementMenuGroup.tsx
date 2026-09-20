import { Menu } from '@chakra-ui/react'
import { FC } from 'react'
import { PiLineSegmentFill, PiNeedle } from 'react-icons/pi'
import { useCommandsContext } from '../../../contexts/CommandsContext'
import { useGlobalSettings } from '../../../hooks/useGlobalSettings'
import { useProject } from '../../../hooks/useProject'
import { useTranslation2 } from '../../../hooks/useTranslation2'
import { CommonCommandIdSchema } from '../../../schemas/command'
import { StepMenuItem } from '../items/StepMenuItem'

export const StepIncrementMenuGroup: FC = () => {
  const { t } = useTranslation2()
  const { project } = useProject()
  const { settings } = useGlobalSettings()
  const { getCommand } = useCommandsContext<CommonCommandIdSchema>()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.edit.increment.name}</Menu.ItemGroupLabel>
      <StepMenuItem
        selectedValue={settings.edit.step}
        subTitle={t.formatters.size(0.1)}
        title={t.project.menus.edit.increment.small}
        icon={PiLineSegmentFill}
        iconScale={0.8}
        value={0.1}
        command={getCommand('increment-small')}
      />
      <StepMenuItem
        selectedValue={settings.edit.step}
        subTitle={t.formatters.size(1)}
        title={t.project.menus.edit.increment.default}
        icon={PiLineSegmentFill}
        value={1}
        command={getCommand('increment-medium')}
      />
      <StepMenuItem
        selectedValue={settings.edit.step}
        subTitle={t.formatters.size(project.stitchingSettings.stitchHoleDistance)}
        title={t.project.menus.edit.increment.stitch}
        icon={PiNeedle}
        value="stitch-hole-distance"
        command={getCommand('increment-stitch-hole-distance')}
      />
    </Menu.ItemGroup>
  )
}
