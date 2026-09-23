import { useCallback } from 'react'
import { useNavigate } from 'react-router'

import type { ProjectFileDropResultSchema } from '../../common/components/common/FileDropzone'
import { toaster } from '../../common/components/Toaster'
import { useTranslation } from '../../common/hooks/useTranslation'
import { electronApi } from '../electronApi'
import { electronAppRoutes } from '../electronAppRoutes'

type UseElectronFileDropHandlerOutput = {
  onDrop: (result: ProjectFileDropResultSchema) => void
}

export const useElectronFileDropHandler = (): UseElectronFileDropHandlerOutput => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const showOpenFailedToast = useCallback((): void => {
    toaster.create({
      closable: true,
      description: t.project.toast.openFailed,
      type: 'error',
    })
  }, [t.project.toast.openFailed])

  const onDrop = useCallback(
    (result: ProjectFileDropResultSchema): void => {
      if (result.type === 'error') {
        toaster.create({
          closable: true,
          description:
            result.error === 'invalid-file-extension'
              ? t.project.toast.dropProjectFileInvalidExtension
              : t.project.toast.dropProjectFileMultipleFiles,
          type: 'error',
        })
        return
      }

      let filePath: string

      try {
        filePath = electronApi.getPathForFile(result.value)
      } catch {
        showOpenFailedToast()
        return
      }

      if (filePath === '') {
        showOpenFailedToast()
        return
      }

      navigate(electronAppRoutes.project(filePath))
    },
    [
      navigate,
      showOpenFailedToast,
      t.project.toast.dropProjectFileInvalidExtension,
      t.project.toast.dropProjectFileMultipleFiles,
    ],
  )

  return { onDrop }
}
