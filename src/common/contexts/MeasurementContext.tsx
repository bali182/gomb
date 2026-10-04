import { createContext } from 'react'

export type MeasurementContextValue = {
  isMeasuring: boolean
  toggleMeasuring: () => void
  stopMeasuring: () => void
}

export const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined)
