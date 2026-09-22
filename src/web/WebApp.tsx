import { Box, Theme } from '@chakra-ui/react'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { FileDropzone, type ProjectFileDropResultSchema } from '../common/components/common/FileDropzone'
import { toaster, Toaster } from '../common/components/Toaster'
import { useTheme } from '../common/hooks/useTheme'
import { useTranslation } from '../common/hooks/useTranslation'
import { portalRef } from '../common/portalRef'
import { WebProjectIndexRoute } from './components/routes/WebProjectIndexRoute'
import { WebProjectRoute } from './components/routes/WebProjectRoute'
import { WebProjectsRoute } from './components/routes/WebProjectsRoute'
import { WebSubProjectRoute } from './components/routes/WebSubProjectRoute'

export const WebApp: FC = () => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const handleProjectFileDrop = useCallback(
    (result: ProjectFileDropResultSchema): void => {
      if (result.type === 'success') {
        console.log(result.value.name)
        return
      }

      toaster.create({
        closable: true,
        description:
          result.error === 'invalid-file-extension'
            ? t.projects.dnd.dropProjectFileInvalidExtension
            : t.projects.dnd.dropProjectFileMultipleFiles,
        type: 'error',
      })
    },
    [t.projects.dnd.dropProjectFileInvalidExtension, t.projects.dnd.dropProjectFileMultipleFiles],
  )

  return (
    <Theme appearance={theme}>
      <FileDropzone onProjectFileDrop={handleProjectFileDrop}>
        <Box as="main" display="flex" flexDirection="column" height="100dvh" overflow="hidden">
          <Box flex="1" minHeight="0" overflow="hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" Component={WebProjectsRoute} />
              <Route path="/projects/:projectId" Component={WebProjectRoute}>
                <Route index Component={WebProjectIndexRoute} />
                <Route path=":subProjectId" Component={WebSubProjectRoute} />
              </Route>
              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Routes>
          </Box>
        </Box>
      </FileDropzone>
      <Toaster />
      <div ref={portalRef} />
    </Theme>
  )
}
