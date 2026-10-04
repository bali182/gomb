import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { electronApi } from '../electronApi'
import { electronAppRoutes } from '../electronAppRoutes'

export const useElectronOpenProjectHandler = (): void => {
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = electronApi.onOpenProject((filePath: string): void => {
      navigate(electronAppRoutes.project(filePath))
    })

    electronApi.reactAppReady()

    return unsubscribe
  }, [navigate])
}
