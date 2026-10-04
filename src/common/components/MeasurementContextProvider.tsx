import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type FC, type PropsWithChildren } from 'react'

import { MeasurementContext, type MeasurementContextValue } from '../contexts/MeasurementContext'
import { useOptionalProject } from '../hooks/useOptionalProject'
import { useOptionalSubProject } from '../hooks/useOptionalSubProject'
import { isDefined } from '../utils/isDefined'

export const MeasurementContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { project } = useOptionalProject()
  const { subProject } = useOptionalSubProject()
  const [isMeasuringInternal, setMeasuring] = useState<boolean>(false)
  const subProjectExists = isDefined(subProject)
  const isMeasuring = isMeasuringInternal && subProjectExists

  const stopMeasuring = useCallback((): void => {
    setMeasuring(false)
  }, [])

  const toggleMeasuring = useCallback((): void => {
    setMeasuring((current) => subProjectExists && !current)
  }, [subProjectExists])

  useLayoutEffect(() => {
    stopMeasuring()
  }, [project?.id, subProject?.id, stopMeasuring])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        stopMeasuring()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stopMeasuring])

  const value = useMemo<MeasurementContextValue>(
    () => ({ isMeasuring, toggleMeasuring, stopMeasuring }),
    [isMeasuring, toggleMeasuring, stopMeasuring],
  )

  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>
}
