import { useCallback, useMemo, useState, type FC, type PropsWithChildren, type ReactNode } from 'react'
import {
  EditorDialogsContext,
  type EditorDialogRequestSchema,
  type EditorDialogsContextValue,
} from '../contexts/EditorDialogsContext'
import { isDefined } from '../utils/isDefined'
import { CloneComponentDialog } from './clone-component-dialog/CloneComponentDialog'
import { CreateBindingsDialog } from './create-bindings-dialog/CreateBindingsDialog'

export const EditorDialogsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [request, setRequest] = useState<EditorDialogRequestSchema | undefined>()

  const openDialog = useCallback((request: EditorDialogRequestSchema): void => {
    setRequest(request)
  }, [])

  const handleOpenChange = useCallback((isOpen: boolean): void => {
    if (!isOpen) {
      setRequest(undefined)
    }
  }, [])

  const value = useMemo<EditorDialogsContextValue>(() => ({ openDialog }), [openDialog])

  const renderDialog = useCallback((): ReactNode => {
    if (!isDefined(request)) {
      return null
    }
    switch (request.type) {
      case 'create-bindings':
        return (
          <CreateBindingsDialog
            source={request.source}
            subProject={request.subProject}
            isOpen={true}
            onOpenChange={handleOpenChange}
          />
        )
      case 'clone-component':
        return (
          <CloneComponentDialog
            component={request.component}
            subProject={request.subProject}
            isOpen={true}
            onOpenChange={handleOpenChange}
          />
        )
    }
  }, [request, handleOpenChange])

  return (
    <EditorDialogsContext.Provider value={value}>
      {children}
      {renderDialog()}
    </EditorDialogsContext.Provider>
  )
}
