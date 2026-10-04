import { Menu } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiRuler } from 'react-icons/pi'

import { useMeasurement } from '../../../hooks/useMeasurement'
import { useTranslation } from '../../../hooks/useTranslation'
import { ToggleMenuItem } from '../items/ToggleMenuItem'

export const MeasurementMenuGroup: FC = () => {
  const { isMeasuring } = useMeasurement()
  const { t } = useTranslation()

  return (
    <Menu.ItemGroup>
      <Menu.ItemGroupLabel>{t.project.menus.edit.measurement.name}</Menu.ItemGroupLabel>
      <ToggleMenuItem
        command="measurement"
        label={t.project.menus.edit.measurement.measurement}
        value={isMeasuring}
        enabledIcon={PiRuler}
        disabledIcon={PiRuler}
      />
    </Menu.ItemGroup>
  )
}
