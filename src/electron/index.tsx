import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { Provider as JotaiProvider } from 'jotai'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
import type { GlobalSettingsSchema } from '../common/schemas/settings'
import '../common/scrollbars.css'
import { appStore } from '../common/state/store'
import { createDefaultGlobalSettings } from '../common/utils/createDefaultGlobalSettings'
import { getSystemTheme } from '../common/utils/getSystemTheme'
import { ElectronApp } from './ElectronApp'
import { ElectronGlobalSettingsContextProvider } from './components/ElectronGlobalSettingsContextProvider'
import { electronApi } from './electronApi'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const electronRouter = createHashRouter([
  {
    path: '*',
    Component: ElectronApp,
  },
])

const renderElectronApp = async (): Promise<void> => {
  let initialSettings: GlobalSettingsSchema

  try {
    initialSettings = await electronApi.getSettings()
  } catch (error) {
    console.error('Unable to initialize Electron global settings:', error)
    initialSettings = createDefaultGlobalSettings(getSystemTheme())
  }

  createRoot(rootElement).render(
    <JotaiProvider store={appStore}>
      <ChakraProvider value={defaultSystem}>
        <ElectronGlobalSettingsContextProvider initialSettings={initialSettings}>
          <RouterProvider router={electronRouter} useTransitions={false} />
        </ElectronGlobalSettingsContextProvider>
      </ChakraProvider>
    </JotaiProvider>,
  )
}

renderElectronApp()
