import { Button, Dialog, IconButton, Portal } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState, type FC } from 'react'
import { PiX } from 'react-icons/pi'
import { useBlocker, type BlockerFunction } from 'react-router'

import { Loadable } from '../../common/loadable'
import { portalRef } from '../../common/portalRef'
import { useTranslation } from '../../common/translations/translation'
import { isDefined } from '../../common/utils/isDefined'
import { electronAppRoutes } from '../electronAppRoutes'
import { useElectronProject } from '../hooks/useElectronProject'

export const ElectronUnsavedChangesGuardDialog: FC = () => {
  const [isWindowCloseRequested, setWindowCloseRequested] = useState(false)
  const isClosing = useRef(false)
  const { electronProject, saveProject } = useElectronProject()
  const t = useTranslation()
  const loadedElectronProject = Loadable.get(electronProject)
  const filePath = loadedElectronProject?.filePath
  const isDirty = loadedElectronProject?.isDirty === true

  const shouldBlockNavigation = useCallback<BlockerFunction>(
    ({ nextLocation }): boolean => {
      if (!isDirty || !isDefined(filePath)) {
        return false
      }

      const projectPath = electronAppRoutes.project(filePath)
      return nextLocation.pathname !== projectPath && !nextLocation.pathname.startsWith(`${projectPath}/`)
    },
    [filePath, isDirty],
  )

  const blocker = useBlocker(shouldBlockNavigation)

  const isDialogOpen = isWindowCloseRequested || blocker.state === 'blocked'

  const closeDialog = useCallback((): void => {
    setWindowCloseRequested(false)

    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  const proceed = useCallback((): void => {
    if (isWindowCloseRequested) {
      isClosing.current = true
      window.close()
      return
    }

    if (blocker.state === 'blocked') {
      blocker.proceed()
    }
  }, [blocker, isWindowCloseRequested])

  const saveAndProceed = useCallback(async (): Promise<void> => {
    await saveProject()
    proceed()
  }, [proceed, saveProject])

  const handleOpenChange = useCallback(
    (details: Dialog.OpenChangeDetails): void => {
      if (!details.open) {
        closeDialog()
      }
    },
    [closeDialog],
  )

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!isDirty || isClosing.current) {
        return
      }

      // Electron recommends this deprecated API to consistently cancel BrowserWindow close operations.
      event.returnValue = false
      setWindowCloseRequested(true)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={isDialogOpen} placement="center">
      <Portal container={portalRef}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <IconButton size="sm" variant="ghost">
                <PiX />
              </IconButton>
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>{t.projects.unsavedChangesDialog.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description>{t.projects.unsavedChangesDialog.description}</Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={proceed} variant="outline">
                {t.projects.unsavedChangesDialog.actions.discard}
              </Button>
              <Button onClick={saveAndProceed} variant="solid">
                {t.projects.unsavedChangesDialog.actions.save}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
