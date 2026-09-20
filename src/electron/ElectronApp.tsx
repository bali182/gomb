import { Box, Theme } from '@chakra-ui/react'
import type { FC } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Toaster } from '../common/components/Toaster'
import { useTheme } from '../common/hooks/useTheme'
import { portalRef } from '../common/portalRef'
import { ElectronUnsavedChangesGuardDialog } from './components/ElectronUnsavedChangesGuardDialog'
import { ElectronProjectIndexRoute } from './components/routes/ElectronProjectIndexRoute'
import { ElectronProjectRoute } from './components/routes/ElectronProjectRoute'
import { ElectronProjectsRoute } from './components/routes/ElectronProjectsRoute'
import { ElectronSubProjectRoute } from './components/routes/ElectronSubProjectRoute'

export const ElectronApp: FC = () => {
  const { theme } = useTheme()

  return (
    <Theme appearance={theme}>
      <Box as="main" display="flex" flexDirection="column" height="100dvh" overflow="hidden">
        <Box flex="1" minHeight="0" overflow="hidden">
          <ElectronUnsavedChangesGuardDialog />
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" Component={ElectronProjectsRoute} />
            <Route path="/project/:filePath" Component={ElectronProjectRoute}>
              <Route index Component={ElectronProjectIndexRoute} />
              <Route path=":subProjectId" Component={ElectronSubProjectRoute} />
            </Route>
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </Box>
      </Box>
      <Toaster />
      <div ref={portalRef} />
    </Theme>
  )
}
