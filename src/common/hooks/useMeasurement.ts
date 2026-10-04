import { useContext } from 'react'

import { MeasurementContext, type MeasurementContextValue } from '../contexts/MeasurementContext'
import { isDefined } from '../utils/isDefined'

export const useMeasurement = (): MeasurementContextValue => {
  const measurement = useContext(MeasurementContext)
  if (!isDefined(measurement)) {
    throw new Error('useMeasurement must be used inside MeasurementContextProvider')
  }
  return measurement
}
