import type { FC } from 'react'

import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { SectionGroup } from '../common/SectionGroup'
import { AppSettingsSection } from './AppSettingsSection'

export const GlobalSettingsEditor: FC = () => {
  const { setAppSettings, settings } = useGlobalSettings()

  return (
    <SectionGroup.Root>
      <AppSettingsSection onChange={setAppSettings} settings={settings.app} />
    </SectionGroup.Root>
  )
}
